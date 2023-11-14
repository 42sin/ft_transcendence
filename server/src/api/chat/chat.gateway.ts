import { Socket } from 'socket.io';
import { Channel } from '../channels/channel.entity';
import { Command } from './utils/Command';
import { EvResponseStatus, EventResponse } from './utils/EventResponse';
import { Logger } from '../../static/Logger';
import {
  OnGatewayConnection,
  OnGatewayInit,
  OnGatewayDisconnect,
  WebSocketGateway,
  SubscribeMessage,
} from '@nestjs/websockets';
import { ChannelsService } from '../channels/channels.service';
import { User } from '../users/user.entity';
import { UpdateResult, InsertResult, Int32 } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Message } from '../messages/message.entity';
import { MessagesService } from '../messages/messages.service';
import { min } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { STATUS_CODES } from 'http';
import { response } from 'express';

/** Gateway */
@WebSocketGateway({
	namespace: 'chat',
	cors: true
})
export class ChatGateway
	implements 
		OnGatewayInit,
		OnGatewayConnection,
		OnGatewayDisconnect {

	readonly users: Map<Socket, string>
	readonly sockets: Map<string, Socket>
	private queue: string|null = null;
	private queueMap: string|null = null;

	constructor (
		private usersService: UsersService,
		private channelsService: ChannelsService,
		private messagesService: MessagesService) 
	{
		this.users = new Map<Socket, string>
		this.sockets = new Map<string, Socket>
	}

	/////////////////////////////////////////////////
	/// event handlers
	/////////////////////////////////////////////////
	afterInit(server: any)
	{
		Logger.success("Server's socket has succesfully been initiated");
	}

	handleConnection(client: Socket, ...args: any[])
	{
		Logger.success_title ("Connected to client. Waiting for login ...", "ChatGateway");
	}

	async handleDisconnect(client: Socket)
	{
		const usernameOfUserDisconnected = this.users.get(client);
		this.sockets.delete (this.users.get (client))
		this.users.delete (client)
		this._removeUserFromQueueIfWaiting(usernameOfUserDisconnected);
		Logger.success_title ("Disconnected to client", "ChatGateway");
	}

	@SubscribeMessage("login")
	private async handleLogin (socket: Socket, data: ILoginEventData)
	{
		const response: EventResponse 
			= new EventResponse ("login", socket);
		
		if (!data.username)
		{
			response.status = EvResponseStatus.INCOMPLETE_REQUEST
			return response.beEmitted ();
		}
	
		//with id would be better
		if (this.users.set (socket, data.username) && this.sockets.set (data.username, socket))
		{
			Logger.success_title ("'" + data.username + "' just successfully logged in.", "ChatGateway");
			response.status = EvResponseStatus.SUCCESS
			let user: User = await this.usersService.getUser (data.username);
			response.data = user;
			return response.beEmitted ();
		}

		response.beEmitted ()
	}

	@SubscribeMessage ("request")
	private async handleInput (socket: Socket, data: IRequestEventData)
	{
		Logger.success_title ("request event caught", "ChatGateway");
		Logger.log ("EventData.input: " + data.input)

		let cmd: Command|null = await this.parse (socket, data);

		if (cmd)
		{
			this.execute (cmd);
		}
		else
		{
			Logger.error("Failed to parse command");
		}
	}

	@SubscribeMessage ("pingOpponent")
	private async handlePingOpponent (socket: Socket, data: IMessageEventData)
	{
		const socketOfRecipient: Socket = this.sockets.get (data.recipient);
		if (!socketOfRecipient)
		{
			return Logger.error("Failed to get socket of recipient @ pingOpponent");
		}
		let eventResponse: EventResponse = new EventResponse("pingOpponent", socketOfRecipient);
		eventResponse.data = data.sender;
		eventResponse.status = EvResponseStatus.SUCCESS;
		eventResponse.beEmitted();
	}

	@SubscribeMessage ("queueStatus")
	private async handleQueueStatus (socket: Socket, data: IMessageEventData)
	{
		Logger.higlight("queueStatus received");
		let eventResponse: EventResponse = new EventResponse("queueStatus", socket);

		if (this.queue)
		{
			eventResponse.data = this.queue + "," + this.queueMap;
		}

		eventResponse.status = EvResponseStatus.SUCCESS;
		eventResponse.beEmitted();
	}

	private _removeUserFromQueueIfWaiting(username: string)
	{
		if (this.queue && this.queue === username)
		{
			this.queue = null;
			this.queueMap = null;
			Logger.warning("Successfully removed " + username + " from queue");
		}
		else if (this.queue)
		{
			Logger.error("Error: user not current user in queue");
		}
		else
		{
			Logger.warning("Error: no user currently in queue");
		}
	}

	@SubscribeMessage ("queueLeft")
	private async handleQueueLeft(socket: Socket, data: IMessageEventData)
	{
		this._removeUserFromQueueIfWaiting(data.sender);
	}

	@SubscribeMessage ("queueJoined")
	private async handleQueueJoined(socket: Socket, data: IMessageEventData)
	{
		if (!this.queue)
		{
			this.queue = data.sender;
			this.queueMap = data.message;
		}
		else
		{
			const socketOf42StudentAlreadyWaiting: Socket = this.sockets.get(this.queue);

			if (socketOf42StudentAlreadyWaiting)
			{
				const eventResponseOf42StudentAlreadyWaiting: EventResponse = new EventResponse("queueJoined", socketOf42StudentAlreadyWaiting);
				eventResponseOf42StudentAlreadyWaiting.data = JSON.stringify ({ opponent: data.sender, playerNumber: 1 });
				eventResponseOf42StudentAlreadyWaiting.status = EvResponseStatus.SUCCESS;
				eventResponseOf42StudentAlreadyWaiting.beEmitted();

				const eventResponse: EventResponse = new EventResponse("queueJoined", socket);
				eventResponse.data = JSON.stringify ({ opponent: this.queue, playerNumber: 2 });
				eventResponse.status = EvResponseStatus.SUCCESS;
				eventResponse.beEmitted();

				this.queue = null;
				this.queueMap = null;
			}
			else
			{
				Logger.error("Failed to get socket of 42 student already joined with username: " + this.queue);
			}
		}
	}

	@SubscribeMessage("ballCoordinates")
	private async handleBallCoordinates(socket: Socket, data: IMessageEventData)
	{
		if (!data.sender || !data.recipient || !data.message)
		{
			Logger.error("invalid ballCoordinates event data");
		}

		const socketOfRecipient: Socket = this.sockets.get(data.recipient);

		if (!socketOfRecipient)
		{
			Logger.error("Failed to find socket of " + data.recipient + " at paddleCoordinates event handler");
		}

		const eventResponse: EventResponse = new EventResponse("ballCoordinates", socketOfRecipient);
		eventResponse.data = data.message;
		eventResponse.status = EvResponseStatus.SUCCESS;
		eventResponse.beEmitted();
	}

  @SubscribeMessage("score")
	private async handleScore(socket: Socket, data: IMessageEventData)
	{
		if (!data.sender || !data.recipient || !data.message)
		{
			Logger.error("invalid score event data");
		}

		const socketOfRecipient: Socket = this.sockets.get(data.recipient);

		if (!socketOfRecipient)
		{
			Logger.error("Failed to find socket of " + data.recipient + " at score event handler");
		}

		const eventResponse: EventResponse = new EventResponse("score", socketOfRecipient);
		eventResponse.data = data.message;
		eventResponse.status = EvResponseStatus.SUCCESS;
		eventResponse.beEmitted();
	}



	@SubscribeMessage("paddleCoordinates")
	private async handlePaddleCoordinates(socket: Socket, data: IMessageEventData)
	{
		if (!data.sender || !data.recipient || !data.message)
		{
			Logger.error("invalid paddleCoordinates event data");
		}

		const socketOfRecipient: Socket = this.sockets.get(data.recipient);

		if (!socketOfRecipient)
		{
			Logger.error("Failed to find socket of " + data.recipient + " at paddleCoordinates event handler");
		}

		const eventResponse: EventResponse = new EventResponse("paddleCoordinates", socketOfRecipient);
		eventResponse.data = data.message;
		eventResponse.status = EvResponseStatus.SUCCESS;
		eventResponse.beEmitted();
	}

	// TODO: responses
	@SubscribeMessage ("msg")
	private async handleMsg (socket: Socket, data: IMessageEventData) {

		Logger.title ("\nNew Msg");

		console.log (data);
		if (!data || !data.message || !data.sender || !data.recipient)
			return Logger.error ("invalid message event")

		let recipientUsernames: string[] = [data.sender]
		let recipientID: string;
		let user: User = await this.usersService.getUser(data.sender)
		if (data.recipient[0] != '#')
		{
			recipientUsernames.push (data.recipient)
			// recipientID = "" + (await this.usersService.getUser (data.recipient)).userID
			const recipient = await this.usersService.getUser(data.recipient);
			console.log('IS BLOCKED ', recipient.blocked.includes(user.userID));
			if (recipient.blocked.includes(user.userID))	{
				const response: EventResponse = new EventResponse('error', socket);
				response.status = EvResponseStatus.USER_HAS_BLOCKED_YOU;
				response.data = recipient.username;
				response.beEmitted();
				return Logger.log('Sender is blocked by recipient')
			}
			if (user.blocked.includes(recipient.userID)){
				const response: EventResponse = new EventResponse('error', socket);
				response.status = EvResponseStatus.USER_IS_BLOCKED;
				response.data = recipient.username;
				response.beEmitted();
				return Logger.log('Recipient is blocked by the sender')
			}
			recipientID = "" + recipient.userID
		}
		else
		{
			const channel: Channel = await this.channelsService.getChannel (data.recipient)

			if (!channel)	{
				const response: EventResponse = new EventResponse('error', socket);
				response.status = EvResponseStatus.NO_SUCH_CHANNEL;
				response.beEmitted();
				return Logger.error ("failed to get channel from database/maybe deleted")
			}
			if (!channel.members)
				return Logger.error ("invalid channel")
			recipientID = "#" + (await this.channelsService.getChannel (data.recipient)).channelID
			console.debug ("members:  " + channel.members)
		
			const rawMembers: string[]  = channel.members.split (",")
			if (rawMembers.length <= 0)
				return Logger.error ("invalid channel")

			// recipientUsernames = await Promise.all (rawMembers.map((value: string) => parseInt (value))
				// .map (async (value: number) => (await this.usersService.getUserByID (value)).username))
			const recipients: User[] = await Promise.all(
				rawMembers.map((value: string) => parseInt(value))
				.map (async (value: number) => (await this.usersService.getUserByID (value))))//.username))
			recipientUsernames = recipients.filter(recipient => {
				return !recipient.blocked.includes(user.userID)
			}).map(recipient => recipient.username)
			// console.log("recipients usernames: ", recipientUsernames);
			if (recipientUsernames.length <= 0)
				return Logger.error ("failed to get members in channel, or members have blocked the sender")
		}
		// const recipientSockets: Socket[] = []

		// this.users.forEach ((value: string, key: Socket) => {
		// 	if (recipientUsernames.includes (value))
		// 		recipientSockets.push (key);
		// })

		// let user: User = await this.usersService.getUser(data.sender)
		const chatsArray = user.chats.split(',');
		if (!chatsArray.includes(recipientID)){
			const response: EventResponse = new EventResponse('error', socket);
			response.status = EvResponseStatus.USER_IS_NOT_IN_CHAT;
			response.beEmitted();
			return Logger.error("sender isn't on the channel") ;
		}
		
		//CHECK IF THE USER IS NOT MUTED
		const channel: Channel = await this.channelsService.getChannel (data.recipient);
		const currentTime = new Date();
		const userIDToCheck = user.userID;

		let isUserMuted = false;
		if (channel && channel.muted.length > 0){
			isUserMuted = channel.muted.some(item => {
				// Check if user_id matches and 'future_time' is greater than 'currentTime'
				const futureTime = new Date(item.future_time);
				return item.user_id === userIDToCheck && futureTime > currentTime;
			  });
		}
	
		console.log("status; ",isUserMuted)
		if (isUserMuted){
			const response: EventResponse = new EventResponse('error', socket);
			response.status = EvResponseStatus.USER_IS_MUTED;
			response.data = data.recipient;
			response.beEmitted();
			return Logger.log('The user is muted')
		}

		let message: Message = new Message (
			user.userID,
			user.username,
			recipientID,
			data.message,
			this.getTime ()
		)

		message = await this.messagesService.createMessage (message);
		if (!message)
		{
			return Logger.error ("failed to save message")
		}

		for (let recipientUsername of recipientUsernames)
		{
			if (this.sockets.get (recipientUsername))
			{
				
				// if (user.userID)
				const response: EventResponse
					=  new EventResponse ("msg", this.sockets.get (recipientUsername));
				response.status = EvResponseStatus.SUCCESS;
				response.data = {
					"sender": data.sender,
					"recipient": data.recipient,
					"messageEntity": message
				};
				response.beEmitted ()
			}
			else
				Logger.error ("failed to get socket")
		
		}
	}

	/////////////////////////////////////////////////
	/// parser
	/////////////////////////////////////////////////
	private async parse (socket: Socket, requestEventData: IRequestEventData): Promise<Command|null> {

		const response: EventResponse = new EventResponse ("error", socket);
		response.status = EvResponseStatus.INTERNAL_SERVER_ERROR

		let tab = requestEventData.input.split (" ");

		let realName: string = ""
		let name: string = ""

		realName = tab[0]
		name = realName

		if (tab[0][0] === '/')
			name = name.substring (1)

		tab.shift ();

		const username = this.users.get (socket);

		if (!username)
		{
			Logger.error ("Fatal error. Failed to get username. User is not logged in");
			response.beEmitted ();
			return null;
		}
		//TODO should be done by userID!

		const user: User = await this.usersService.getUser (username);

		if (!user)
		{
			Logger.error ("failed to get user")
			response.beEmitted ();
			return null
		}

		user.setSocket (socket);
		return new Command (user, realName, name, tab, requestEventData.recipient);
	}


	/////////////////////////////////////////////////
	/// controller
	/////////////////////////////////////////////////
	// only for chat commands
	private execute (cmd: Command): void {

		switch (cmd.getName ()) {

			case "JOIN":
				this.executeJoin (cmd);
				break;

			case "TALK_TO":
				this.executeTalk_to (cmd);
				break;
			
			case "INVITE":
				this.executeInvite(cmd);
				break;
			
			case "DELETE":
				this.executeDelete(cmd);
				break;

			case "KICK":
				this.executeKick(cmd);
				break;

			case "BAN":
				this.executeBan(cmd);
				break;
			
			case "MUTE":
				this.executeMute(cmd);
				break;
			
			case "BLOCK":
				this.executeBlock(cmd);
				break;
			
			case "UNBLOCK":
				this.executeUnblock(cmd);
				break;
				
			case "ADD_ADMIN":
				this.executeAdd_admin(cmd);
				break;
			
			case "CHANGE_PASSWORD":
				this.executeChangePw(cmd);
				break;
			
			case "PART":
				this.executePart(cmd);
				break;
			
			case "ACCEPT":
				this.executeAccept(cmd);
				break;
	
			default:
				let errorResponse: EventResponse = new EventResponse ("error",
				cmd.getUser ().getSocket ());
				errorResponse.status = EvResponseStatus.NO_SUCH_CMD
				errorResponse.data = cmd.getName ()
				errorResponse.beEmitted ()
		}
	}

	/////////////////////////////////////////////////
	/// executers
	/////////////////////////////////////////////////

	private async executeTalk_to (cmd: Command): Promise<void> {

		let response: EventResponse = new EventResponse ("talk_to", 
			cmd.getUser ().getSocket ());

		if (cmd.getArgs ().length == 0)
		{
			response.status = EvResponseStatus.INVALID_ARGS_COUNT
			return response.beEmitted ()
		}
		let usernames = cmd.getArgs ()[0].split (",");
		if (usernames.length == 0)
		{
			response.status = EvResponseStatus.INVALID_ARGS_COUNT
			return response.beEmitted ()
		}

		for (let username of usernames)
		{
			let userOther: User = await this.usersService.getUser (username);

			if (!userOther)
			{
				response.status = EvResponseStatus.NO_SUCH_USER;
				response.beEmitted ();
				continue ;
			}

			let userSelf: User = cmd.getUser ();

			const other_blocked_users = userOther.blocked.map(id => id.toString());
			if (other_blocked_users.includes (userSelf.userID.toString ()))
			{
				response.status = EvResponseStatus.USER_HAS_BLOCKED_YOU;
				response.beEmitted ();
				continue ;
			}

			const user_blocked_users = userSelf.blocked.map(id => id.toString());
			if (user_blocked_users.includes (userOther.userID.toString ()))
			{
				response.status = EvResponseStatus.USER_IS_BLOCKED;
				response.beEmitted ();
				continue ;
			}

			const split_chats: string[] = userSelf.chats.split (",");
			if (split_chats.includes (userOther.userID.toString ()))
			{
				response.status = EvResponseStatus.USER_ALREADY_ADDED;
				response.beEmitted ();
				continue ;
			}


			if (userSelf.chats)
				userSelf.chats += ",";

			userSelf.chats += userOther.userID;

			const userSelfSaved: User|void = await this.usersService.saveUser (userSelf).catch ((error) => {
				Logger.error (error)
			});

			if (!userSelfSaved)
			{
				response.status = EvResponseStatus.FAILURE;
				response.beEmitted ();
				continue ;
			}

			if (userOther.chats)
				userOther.chats += ",";

			userOther.chats += userSelf.userID;

			const userOtherSaved: User|void = await this.usersService.saveUser (userOther).catch ((error) => {
				Logger.error (error)
			});

			if (!userOtherSaved)
			{
				response.status = EvResponseStatus.FAILURE;
				response.beEmitted ();
				continue ;
			}

			response.status = EvResponseStatus.SUCCESS;
			response.data = userOtherSaved;
			response.beEmitted ();
		}
	}

	private parseArgs (args: string[], passwords: boolean, channelsLen: number): any[] {

		let params: any[] = [];
		let i: number = -1;
		let arg: string;
		let argSplit: string[] = [];
		let defValue: any;

		// find the necessary arg from idx 0 to 1
		while (++i < args.length)
		{
			if ((!passwords && args[i][0] === '+')
				|| (passwords && args[i][0] !== '+'))
			{
				arg = args[i];
				break ;
			}
		}

		// split the arg
		if (arg)
		{
			argSplit = arg.split (",")
		}

		// fill the params to return with def or provided values
		i = -1;
		while (++i < channelsLen)
		{
			defValue = ""
			if (!passwords)
				defValue = false;

			if (i < argSplit.length)
			{
				if (passwords && argSplit[i])
					defValue = argSplit[i];
				else if (!passwords && argSplit[i].includes ('h'))
					defValue = true;
			}

			params.push (defValue);
		}

		return params;
	}
	
	private async executeJoin (cmd: Command): Promise<void> {

		let response: EventResponse = new EventResponse ("join", 
			cmd.getUser ().getSocket ());

		if (cmd.getArgs ().length == 0)
		{
			response.status = EvResponseStatus.INVALID_ARGS_COUNT
			return response.beEmitted ()
		}

		let channelNames = cmd.getArgs ()[0].split (",");
		if (channelNames.length == 0)
		{
			response.status = EvResponseStatus.INVALID_ARGS_COUNT
			return response.beEmitted ()
		}

		/** additional settings */
		cmd.getArgs ().shift ();
		const channelPasswords: string[] 
			= this.parseArgs (cmd.getArgs (), true, channelNames.length)
		const channelPrivateStatuses: boolean[] 
			= this.parseArgs (cmd.getArgs (), false, channelNames.length)

		let i: number = -1;
		let password: string;

		for (let channelName of channelNames)
		{
			// '#' are not allow in the name of the chat
			if (channelName.length <= 1 || channelName.charAt(0) != '#' || channelName.substring(1).includes("#")) {
				response.status = EvResponseStatus.INVALID_CHANNNAME;
				response.beEmitted();
				continue;
			}

			i++;
			password = channelPasswords[i];
				
			response.data = channelName;

			let channel: Channel = await this.channelsService.getChannel (channelName);
			let nMembers: string = "";

			/** check whether channel exists, if not create */
			if (!channel)
			{
				if (password) {
					/* hash password if one exists */
					try {
						const hash = await this.hashPassword(password);
						password = hash;
						console.log('hashed password:', hash);
					} catch (err) {
						console.error('Error hashing channel password: ', err);
						Logger.error('Error hashing channel password');
						response.status = EvResponseStatus.FAILURE;
						return response.beEmitted();
					}
					/* done hashing password */
				}
				channel = await this.channelsService.saveChannel
					(new Channel (
						channelName,
						password,
						channelPrivateStatuses[i],
						cmd.getUser ().userID));

				if (!channel)
				{
					Logger.error ("internal error: failed to create channel")
					response.status = EvResponseStatus.INTERNAL_SERVER_ERROR;
					response.beEmitted ();
					continue ;
				}
			}
			else
			{
				if (channel.members.includes (cmd.getUser ().userID.toString ()))
					response.status = EvResponseStatus.USER_ALREADY_ON_CHANN;
				else if (channel.privateStatus)
					response.status = EvResponseStatus.PRIVATE_CHANN_ACCESS_DENIED;
				else if (channel.password && !password)
					response.status = EvResponseStatus.PROTECTED_CHANN_ACCESS_DENIED;
				else if (channel.password && !bcrypt.compareSync(password, channel.password))
					response.status = EvResponseStatus.CHANN_INVALID_KEY;
				else if (channel.banned.includes (cmd.getUser ().userID.toString ()))
					response.status = EvResponseStatus.USER_IS_BANNED;

				if (response.status != EvResponseStatus.FAILURE)
				{
					response.beEmitted ()
					continue ;
				}

				nMembers = channel.members + ","
			}

			nMembers += cmd.getUser ().userID.toString ()
			channel.members = nMembers;
			const savedChannel: Channel|void = await this.channelsService.saveChannel(channel)
				.catch(error => {
					Logger.error (error);
					response.status = EvResponseStatus.FAILURE;
				});

			if (savedChannel)
			{
				response.data = savedChannel;
				let nChats: string = cmd.getUser ().chats;
	
				if (!nChats)
					nChats = "#" + channel.channelID.toString ();
				else
					nChats += ",#" + channel.channelID.toString ();
	
				let result: UpdateResult = await this.usersService.updateUsers (
					{ userID: cmd.getUser ().userID  }, 
						{ chats: nChats});
				
				if (result.affected === 1)
					response.status = EvResponseStatus.SUCCESS;
				else if (result.affected < 1)
					response.status = EvResponseStatus.FAILURE;
				else
					response.status = EvResponseStatus.INTERNAL_SERVER_ERROR;
			}

			response.beEmitted ();
			if (savedChannel)
				await this.sendRefreshMembers(channel.members.split(','), "", savedChannel);
		}
	}

	private async executeInvite (cmd: Command): Promise<void> {

		let response: EventResponse = new EventResponse ("invite", 
			cmd.getUser ().getSocket ());
		
		const username_invited = cmd.getArgs ()[0];

		//Check arg of the cmd
		if (!username_invited){
			response.status = EvResponseStatus.NO_USER_GIVEN;
			return response.beEmitted ();
		}
		let user: User = await this.usersService.getUser (username_invited);

		//If the user_invited exists, is not him/herself
		if (!user){
			response.data = username_invited;
			response.status = EvResponseStatus.NO_SUCH_USER;
		}
		else if (cmd.getUser ().username == username_invited)
		{
			response.data = username_invited;
			response.status = EvResponseStatus.USER_IS_YOURSELF;
		}
		else if (!user.online){ 
			response.data = username_invited;
			response.status = EvResponseStatus.USER_NOT_AVAILABLE;
		}
		else {
			await this.sendInvite(cmd.getUser(), username_invited);
			//set invitation to pending for the one that gets invited
			user.invitationstatus = EvResponseStatus.INVITE_PENDING;
			user.inviteHost = cmd.getUser().username;
			await this.usersService.updateUsers(
				{ userID: user.userID },
				{ invitationstatus: user.invitationstatus, inviteHost: user.inviteHost }
			);
			//set invitation to pending for the one that sent the invite
			cmd.getUser().invitationstatus = EvResponseStatus.INVITE_SENT_PENDING;
			await this.usersService.updateUsers(
				{ userID: cmd.getUser().userID },
				{ invitationstatus: cmd.getUser().invitationstatus, inviteHost: '' }
			);
			response.data = username_invited;
			response.status = EvResponseStatus.SUCCESS;
		}
		response.beEmitted ();
	}

	private async executeAccept (cmd: Command): Promise<void> {
		let response: EventResponse = new EventResponse ("accept", cmd.getUser().getSocket());

		if (!cmd.getArgs()[0]) {
			response.status = EvResponseStatus.NO_USER_GIVEN;
			return response.beEmitted();
		}
		const inviteHost = await this.usersService.getUser(cmd.getArgs()[0]);
		if (!inviteHost) {
			response.data = cmd.getArgs()[0];
			response.status = EvResponseStatus.NO_SUCH_USER;
		}
		else if (cmd.getUser().username == inviteHost.username) {
			response.data = inviteHost.username;
			response.status = EvResponseStatus.USER_IS_YOURSELF;
		}
		else if (cmd.getUser().invitationstatus !== EvResponseStatus.INVITE_PENDING || inviteHost.invitationstatus !== EvResponseStatus.INVITE_SENT_PENDING) {
			response.data = inviteHost.username;
			response.status = EvResponseStatus.NOT_INVITED;
		}
		else if (cmd.getUser().inviteHost !== inviteHost.username) {
			Logger.higlight('here: inviteHost:' + cmd.getUser().inviteHost + ' inviteHostusername: ' + inviteHost.username)
			response.data = inviteHost.username;
			response.status = EvResponseStatus.NOT_INVITED;
		}
		else {
			await this.sendAccept(inviteHost.username, cmd.getUser().username);
			cmd.getUser().invitationstatus = EvResponseStatus.INVITE_ACCEPTED;
			inviteHost.invitationstatus = EvResponseStatus.INVITE_ACCEPTED;
			await this.usersService.updateUsers(
				{ userID: cmd.getUser().userID },
				{ invitationstatus: cmd.getUser().invitationstatus, inviteHost: '' }
			);
			await this.usersService.updateUsers(
				{ userID: inviteHost.userID },
				{ invitationstatus: inviteHost.invitationstatus, inviteHost: '' }
			);
			response.status = EvResponseStatus.SUCCESS;
			response.data = inviteHost.username;
		}
		response.beEmitted();
	}

	private async executeDelete (cmd: Command): Promise<void> {

		let response: EventResponse = new EventResponse ("delete", 
			cmd.getUser ().getSocket ());
		if (!cmd.getArgs().length)	{
			/** no args */
			response.status = EvResponseStatus.INVALID_ARGS_COUNT
		}	else	{
			/**only handling one argument */
			/** channel name with #name */
			// console.log(cmd.getArgs())
			const channel = await this.channelsService.getChannel(cmd.getArgs()[0]);
			// console.log(cmd.getUser().userID, channel.owner)
			if (!channel)	{
				response.status = EvResponseStatus.NO_SUCH_CHANNEL;
			}	else if (channel.hasOwnProperty('owner') && cmd.getUser().userID !== channel.owner) {
				response.status = EvResponseStatus.USER_IS_NOT_OWNER
			}	else	{
				const chanID = '#' + channel.channelID;
				const members = channel.members.split(',');
				for (let member of members)	{
					const user = await this.usersService.getUserByID(Number.parseInt(member));
					const newChats = user.chats.split(',')
						.filter(item => item !== chanID)
						.join(',');
					try	{
						await this.usersService.updateUsers(
							{userID: user.userID},
							{chats: newChats}
						)
					}	catch (error)	{
						console.log(error)
					}
				}
					try	{
						await this.messagesService.deleteChannelMessages(channel.name)
					} catch	(error)	{
						console.log(error)
					}
					try	{
						const name = channel.name;
						await this.channelsService.deleteChannel(channel.channelID);
						response.status = EvResponseStatus.SUCCESS;
						response.data = name;
						this.sendDeleteChannel(members, name, cmd.getUser().username, cmd.getName());
					}	catch	(error)	{
						console.log(error);
						response.status = EvResponseStatus.INTERNAL_SERVER_ERROR
					}
			}
		}
		response.beEmitted ();
	}

	/* /KICK + #Channel_name + username_to_ */
	private async executeKick (cmd: Command): Promise<void> {

		let response: EventResponse = new EventResponse ("kick", 
			cmd.getUser ().getSocket ());
		
		const channel_name = cmd.getArgs ()[0];
		const username_to_kick = cmd.getArgs ()[1];
		const my_username = cmd.getUser ().username;
	
		//CHECK FOR CHANNEL_NAME
		response.status = EvResponseStatus.NO_CHANNEL_GIVEN;
		if (!channel_name){
			return response.beEmitted ();
		}
		let channel: Channel = await this.channelsService.getChannel (channel_name);
		if (!channel){
			response.status = EvResponseStatus.NO_SUCH_CHANNEL;
			return response.beEmitted ();
		}
	
		//CHECK FOR USERNAME_TO_KICK
		if (!username_to_kick){
		response.status = EvResponseStatus.NO_USER_GIVEN;
			return response.beEmitted ();
		}
		let user: User = await this.usersService.getUser (username_to_kick);
		if (!user){
			response.status = EvResponseStatus.NO_SUCH_USER;
			return response.beEmitted ();
		}
		if (my_username == username_to_kick){
			response.status = EvResponseStatus.USER_IS_YOURSELF;
			return response.beEmitted ();
		}
	
		//CHECK IF USER IS ADMIN
		if(!channel.admins.includes(cmd.getUser().userID.toString()))
		{
			response.status = EvResponseStatus.USER_IS_NOT_ADMIN;
			return response.beEmitted();
		}
			
		//USERNAME_TO_KICK SHOULD BE IN THE CHAT
		const channel_members = channel.members && channel.members.split(",") || [];
		let is_user_to_kick_in_chat: boolean = false;
		let index = -1;
		for (let member of channel_members){
			index++;
			if (parseInt(member,10) === user.userID){
				is_user_to_kick_in_chat = true;
				break;
			}
		}
		if (!is_user_to_kick_in_chat){
			response.status = EvResponseStatus.USER_TO_KICK_IS_NOT_IN_CHAT;
			return response.beEmitted();
		}

		//USERNAME_TO_KICK CAN NOT BE THE OWNER OF THE CHAT
		const owner_channel = channel.owner;
		if (owner_channel === user.userID)
		{
			response.status = EvResponseStatus.USER_TO_KICK_IS_OWNER;
			return response.beEmitted();
		}
		//KICK THE USER_TO_KICK (3 Steps)
		else
		{
			const user_chats = user.chats && user.chats.split(",") || [];
			const channelIDString = '#' + channel.channelID.toString();
			const index_user_chats = user_chats.indexOf(channelIDString);
			try{
				//1)delete chat_name from user_to_kich-data-chats
				this.sendDeleteChannel(channel_members, channel.name, cmd.getUser().username, cmd.getName());
				user_chats.splice(index_user_chats, 1);
				await this.usersService.updateUsers(
					{ userID: user.userID },
					{ chats: user_chats.join(',') }
				)
				//2) and user from chat_members and admin
				channel_members.splice(index, 1);
				await this.channelsService.updateChannels(
					{ channelID: channel.channelID },
					{ members: channel_members.join(',') }
				)
				//3) and user from chat_admins if he/she is there
				const channel_admins = channel.admins && channel.admins.split(",") || [];
				let user_to_kick_is_admin: boolean = false;
				let index_is_admin = -1;
				for (let admin_ID  of channel_admins){
					index_is_admin++;
					if (parseInt(admin_ID,10) === user.userID){
						user_to_kick_is_admin = true;
						break;
					}
				}
				if (user_to_kick_is_admin)
				{
					channel_admins.splice(index_is_admin, 1);
					await this.channelsService.updateChannels(
						{ channelID: channel.channelID },
						{ admins: channel_admins.join(',') }
					)
				}
				//--------------------
				response.data = username_to_kick;
				response.status = EvResponseStatus.SUCCESS;
			}catch (error) {
				Logger.error(error);
				response.status = EvResponseStatus.FAILURE;
			}
		}
		//debug info
		let newchannel: Channel = await this.channelsService.getChannel (channel_name);
		console.log("NewChannel info after KICK: ",newchannel);
		//----------

		response.beEmitted ();
		this.sendRefreshMembers(channel_members, "", newchannel);
	}

	/* /BAN + #Channel_name + username_to_ */
	private async executeBan (cmd: Command): Promise<void> {

		let response: EventResponse = new EventResponse ("ban", 
			cmd.getUser ().getSocket ());
		
		const channel_name = cmd.getArgs ()[0];
		const username_to_ban = cmd.getArgs ()[1];
		const my_username = cmd.getUser ().username;
		
		//CHECK FOR CHANNEL_NAME
		response.status = EvResponseStatus.NO_CHANNEL_GIVEN;
		if (!channel_name){
			return response.beEmitted ();
		}
		let channel: Channel = await this.channelsService.getChannel (channel_name);
		if (!channel){
			response.status = EvResponseStatus.NO_SUCH_CHANNEL;
			return response.beEmitted ();
		}

		//CHECK FOR USERNAME_TO_BAN
		if (!username_to_ban){
			response.status = EvResponseStatus.NO_USER_GIVEN;
				return response.beEmitted ();
			}
			let user: User = await this.usersService.getUser (username_to_ban);
			if (!user){
				response.status = EvResponseStatus.NO_SUCH_USER;
				return response.beEmitted ();
			}
			if (my_username == username_to_ban){
				response.status = EvResponseStatus.USER_IS_YOURSELF;
				return response.beEmitted ();
			}

		//CHECK IF USER IS ADMIN
		if(!channel.admins.includes(cmd.getUser().userID.toString()))
		{
			response.status = EvResponseStatus.USER_IS_NOT_ADMIN;
			return response.beEmitted();
		}

		//USERNAME_TO_BAN SHOULD BE IN THE CHAT
		const channel_members = channel.members && channel.members.split(",") || [];
		let is_user_to_ban_in_chat: boolean = false;
		let index = -1;
		for (let member of channel_members){
			index++;
			if (parseInt(member,10) === user.userID){
				is_user_to_ban_in_chat = true;
				break;
			}
		}
		if (!is_user_to_ban_in_chat){
			response.status = EvResponseStatus.USER_TO_BAN_IS_NOT_IN_CHAT;
			return response.beEmitted();
		}
	
		//USERNAME_TO_BAN CAN NOT BE THE OWNER OF THE CHAT
		const owner_channel = channel.owner;
		if (owner_channel === user.userID)
		{
			response.status = EvResponseStatus.USER_TO_BAN_IS_OWNER;
			return response.beEmitted();
		}
		//BAN THE USER_TO_BAN (4 Steps)
		else
		{
			const user_chats = user.chats && user.chats.split(",") || [];
			const channelIDString = '#' + channel.channelID.toString();
			const index_user_chats = user_chats.indexOf(channelIDString);
			try{
				//1)delete chat_name from user_to_ban-data-chats
				this.sendDeleteChannel(channel_members, channel.name, cmd.getUser().username, cmd.getName());
				user_chats.splice(index_user_chats, 1);
				await this.usersService.updateUsers(
					{ userID: user.userID },
					{ chats: user_chats.join(',') }
				)
				//2) and user from chat_members
				channel_members.splice(index, 1);
				await this.channelsService.updateChannels(
					{ channelID: channel.channelID },
					{ members: channel_members.join(',') }
				)
				//3) and user from chat_admins if he/she is there
				let user_to_ban_is_admin: boolean = false;
				let index_is_admin = -1;
				const channel_admins = channel.admins && channel.admins.split(",") || [];
				for (let admin_ID  of channel_admins){
					index_is_admin++;
					if (parseInt(admin_ID,10) === user.userID){
						user_to_ban_is_admin = true;
						break;
					}
				}
				if (user_to_ban_is_admin)
				{
					channel_admins.splice(index_is_admin, 1);
					await this.channelsService.updateChannels(
						{ channelID: channel.channelID },
						{ admins: channel_admins.join(',') }
					)
				}
				//4) and add user_to_ban to chat.banned
				let new_channel_banned = channel.banned;
				if (new_channel_banned === ""){
					new_channel_banned += user.userID;
				}
				else {
					new_channel_banned += "," + user.userID;
				}
				await this.channelsService.updateChannels(
					{channelID: channel.channelID},
					{banned: new_channel_banned}
				)
				//--------------------
				response.data = username_to_ban;
				response.status = EvResponseStatus.SUCCESS;
			}catch (error) {
				Logger.error(error);
				response.status = EvResponseStatus.FAILURE;
			}
		}
		//debug info
		let newchannel: Channel = await this.channelsService.getChannel (channel_name);
		console.log("NewChannel info after BAN: ",newchannel);
		//----------

		response.beEmitted ();
		this.sendRefreshMembers(channel_members, "", newchannel);
	}

	/* /MUTE + #Channel_name + username_to_mute */
	private async executeMute (cmd: Command): Promise<void> {

		let response: EventResponse = new EventResponse ("mute", 
			cmd.getUser ().getSocket ());
		
		const args = cmd.getArgs();
		const channel_name = args[0];
		const username_to_mute = args[1];
		const my_username = cmd.getUser ().username;
		
		//CHECK FOR CHANNEL_NAME
		response.status = EvResponseStatus.NO_CHANNEL_GIVEN;
		if (!channel_name){
			return response.beEmitted ();
		}
		let channel: Channel = await this.channelsService.getChannel (channel_name);
		if (!channel){
			response.status = EvResponseStatus.NO_SUCH_CHANNEL;
			return response.beEmitted ();
		}

		//CHECK FOR USERNAME_TO_MUTE
		if (!username_to_mute){
			response.status = EvResponseStatus.NO_USER_GIVEN;
				return response.beEmitted ();
			}
			let user: User = await this.usersService.getUser (username_to_mute);
			if (!user){
				response.status = EvResponseStatus.NO_SUCH_USER;
				return response.beEmitted ();
			}
			if (my_username == username_to_mute){
				response.status = EvResponseStatus.USER_IS_YOURSELF;
				return response.beEmitted ();
			}

		//CHECK IF USER IS ADMIN
		if(!channel.admins.includes(cmd.getUser().userID.toString()))
		{
			response.status = EvResponseStatus.USER_IS_NOT_ADMIN;
			return response.beEmitted();
		}

		//USERNAME_TO_MUTE SHOULD BE IN THE CHAT
		const channel_members = channel.members && channel.members.split(",") || [];
		let is_user_to_ban_in_chat: boolean = false;
		let index = -1;
		for (let member of channel_members){
			index++;
			if (parseInt(member,10) === user.userID){
				is_user_to_ban_in_chat = true;
				break;
			}
		}
		if (!is_user_to_ban_in_chat){
			response.status = EvResponseStatus.USER_TO_MUTE_IS_NOT_IN_CHAT;
			return response.beEmitted();
		}
	
		//USERNAME_TO_MUTE CAN NOT BE THE OWNER OF THE CHAT
		const owner_channel = channel.owner;
		if (owner_channel === user.userID)
		{
			response.status = EvResponseStatus.USER_TO_MUTE_IS_OWNER;
			return response.beEmitted();
		}
		//ADD THE USER_TO_MUTE + time until is muted TO channel.mute
		else
		{
			try{
				//default value of minutes to mute set to 10 minutes
				let minutes_to_mute=10;
				if (args.length > 1){
					const minutes = parseInt(args[2], 10);
					if (!isNaN(minutes) && minutes > 0)
					minutes_to_mute = minutes;
					else{
							response.status = EvResponseStatus.INVALID_MINUTES_TO_MUTE;
							return response.beEmitted ();
						}
				}
				// Get the current time
				const currentTime = new Date();
				// Create a Date object representing the futureTime (time + minutes_to_mute) to finish with the sanction
				const futureTime = new Date(currentTime.getTime() + minutes_to_mute * 60 * 1000);
				
				const userIDToAdd: number = user.userID;
				let channel_muted = channel.muted;

				//UPDATE ARRAY (filter expired dates)
				const current_channel_mute = channel.muted.filter(item => {
					const futureTime = new Date(item.future_time);
					return futureTime > currentTime;
				  });

				const isUserMuted = current_channel_mute.some(item => item.user_id === userIDToAdd);

				/* DEBUG INFO ---------------------- */
				console.log("Channel info original:", channel_muted)
				console.log("Channel info:", current_channel_mute)
				console.log("user info:", userIDToAdd)
				console.log("status hereeee",isUserMuted)
				/* ---------------------- */

				if (!isUserMuted) {
					// If the user is not already muted, add a new item
					const newElement = { user_id: userIDToAdd, future_time: futureTime };
					current_channel_mute.push(newElement);
				}
				else
				{
					response.status = EvResponseStatus.USER_IS_ALREADY_MUTED;
					return response.beEmitted ();
				}
				
				await this.channelsService.updateChannels(
					{channelID: channel.channelID},
					{muted: current_channel_mute}
				)
				//--------------------
				response.data = username_to_mute;
				response.status = EvResponseStatus.SUCCESS;
			}catch (error) {
				Logger.error(error);
				response.status = EvResponseStatus.FAILURE;
			}
		}
		//debug info
		let newchannel: Channel = await this.channelsService.getChannel (channel_name);
		console.log("NewChannel info after MUTE: ",newchannel);
		//----------

		response.beEmitted ();
	}

	private async executeBlock (cmd: Command): Promise<void> {

		let response: EventResponse = new EventResponse ("block", 
			cmd.getUser ().getSocket ());
		
		const username_to_block = cmd.getArgs ()[0];

		//Check arg of the cmd
		if (!username_to_block){
			response.status = EvResponseStatus.NO_USER_GIVEN;
			return response.beEmitted ();
		}
		let user: User = await this.usersService.getUser (username_to_block);
	
		const myUser: User = cmd.getUser();
		//If the user_to_block exists & is not him/herself
		if (!user){
			response.data = username_to_block;
			response.status = EvResponseStatus.NO_SUCH_USER;
		}
		// else if (cmd.getUser ().username == username_to_block)
		else if (myUser.username === username_to_block)
		{
			response.data = username_to_block;
			response.status = EvResponseStatus.USER_IS_YOURSELF;
		}
		else if (myUser.blocked.find(searchingID => searchingID === user.userID)) {
			response.data = username_to_block;
			response.status = EvResponseStatus.USER_ALREADY_BLOCKED;
		}
		else
		{
			response.data = username_to_block;
			try	{
			// add username_to_block to user-data-blocked[]
				await this.usersService.blockUser(myUser.userID, user.userID)
				myUser.blocked.push(user.userID);
				response.status = EvResponseStatus.SUCCESS;
			}	catch (error)	{
				response.status = EvResponseStatus.INTERNAL_SERVER_ERROR;	
			}

		}
		response.beEmitted ();
		const channel = await this.channelsService.getChannel(cmd.getRecipient());
		await this.sendRefreshMessages(myUser, channel);
	}

	private async executeUnblock (cmd: Command): Promise<void> {

		let response: EventResponse = new EventResponse ("unblock",
			cmd.getUser ().getSocket ());
		
		const username_to_unblock = cmd.getArgs ()[0];

		//Check arg of the cmd
		if (!username_to_unblock){
			response.status = EvResponseStatus.NO_USER_GIVEN;
			return response.beEmitted ();
		}
		let user: User = await this.usersService.getUser (username_to_unblock);
		
		//If the user_invited exists, is not him/herself
		if (!user){
			response.data = username_to_unblock;
			response.status = EvResponseStatus.NO_SUCH_USER;
		}
		else if (cmd.getUser ().username == username_to_unblock)
		{
			response.data = username_to_unblock;
			response.status = EvResponseStatus.USER_IS_YOURSELF;
		}
		else
		{
			try	{
				await this.usersService.unBlockUser(cmd.getUser().userID, user.userID);
				response.data = username_to_unblock;
				cmd.getUser().blocked = cmd.getUser().blocked.filter(num => num !== user.userID);
				response.status = EvResponseStatus.SUCCESS;
			}	catch (error)	{
				response.status = EvResponseStatus.INTERNAL_SERVER_ERROR
			}

		}

		response.beEmitted ();
		const channel = await this.channelsService.getChannel(cmd.getRecipient());
		await this.sendRefreshMessages(cmd.getUser(), channel);
	}

	/* /ADD_ADMIN + #Channel_name + username_to_add */
	private async executeAdd_admin (cmd: Command): Promise<void> {

		let response: EventResponse = new EventResponse ("add_admin", 
			cmd.getUser ().getSocket ());
		
		const channel_name = cmd.getArgs ()[0];
		const username_to_add = cmd.getArgs ()[1];
		const my_username = cmd.getUser ().username;

		//CHECK FOR CHANNEL_NAME
		if (!channel_name){
			response.status = EvResponseStatus.NO_CHANNEL_GIVEN;
			return response.beEmitted ();
		}
		let channel: Channel = await this.channelsService.getChannel (channel_name);
		if (!channel){
			response.status = EvResponseStatus.NO_SUCH_CHANNEL;
			return response.beEmitted ();
		}

		//CHECK FOR USERNAME_TO_ADD
		if (!username_to_add){
			response.status = EvResponseStatus.NO_USER_GIVEN;
			return response.beEmitted ();
		}
		let user: User = await this.usersService.getUser (username_to_add);
		if (!user){
			response.status = EvResponseStatus.NO_SUCH_USER;
			return response.beEmitted ();
		}
		if (my_username == username_to_add){
			response.status = EvResponseStatus.USER_IS_YOURSELF;
			return response.beEmitted ();
		}

		//CHECK IF USER IS ADMIN
		if(!channel.admins.includes(cmd.getUser().userID.toString()))
		{
			response.status = EvResponseStatus.USER_IS_NOT_ADMIN;
			return response.beEmitted();
		}
		
		//USERNAME_TO_ADD SHOULD BE IN THE CHAT 
		if (!channel.members.includes(user.userID.toString())){
			response.status = EvResponseStatus.USER_TO_ADD_IS_NOT_IN_CHAT;
			return response.beEmitted();
		}

		//add user to the chat_admin string if he/she is not there yet
		if(channel.admins.includes(user.userID.toString())){
			response.status = EvResponseStatus.USER_ALREADY_ADDED;
		}
		else
		{
			try{
				await this.channelsService.updateChannels(
					{channelID: channel.channelID},
					{admins: channel.admins += "," + user.userID}
					)
				response.data = username_to_add;
				response.status = EvResponseStatus.SUCCESS;
			}catch (error) {
				Logger.error(error);
				response.status = EvResponseStatus.FAILURE;
			}
		}

		//debug info
		let newchannel: Channel = await this.channelsService.getChannel (channel_name);
		console.log("NewChannel info after ADD_ADMIN: ",newchannel);
		//----------

		response.beEmitted ();
	}

/* "/CHANGE_PASSWORD #channelname [password]" to change/add a password
   "/CHANGE_PASSWORD #channelname" to remove password */
	private async executeChangePw (cmd: Command): Promise<void> {
		let response: EventResponse = new EventResponse ("change_password", 
			cmd.getUser ().getSocket ());
		
		const channel_name = cmd.getArgs ()[0];
		const new_password = cmd.getArgs ()[1];
		const my_username = cmd.getUser ().username;

		//CHECK FOR CHANNEL_NAME
		if (!channel_name) {
			response.status = EvResponseStatus.NO_CHANNEL_GIVEN;
			return response.beEmitted();
		}
		let channel: Channel = await this.channelsService.getChannel (channel_name);
		if (!channel) {
			response.status = EvResponseStatus.NO_SUCH_CHANNEL;
			return response.beEmitted();
		}
		if (channel.hasOwnProperty('owner') && cmd.getUser().userID !== channel.owner) {
			response.status = EvResponseStatus.USER_IS_NOT_OWNER;
			return response.beEmitted();
		}
		if (!new_password && !channel.password) {
			response.status = EvResponseStatus.NO_PASSWORD_SET;
			return response.beEmitted();
		}
		try {
			if (!new_password) {
				await this.channelsService.updateChannels(
					{channelID:channel.channelID},
					{password: ""})
				response.data = "";
				response.status = EvResponseStatus.SUCCESS;
				return response.beEmitted();
			}
			else {
				const hash = await this.hashPassword(new_password);
				await this.channelsService.updateChannels(
					{channelID: channel.channelID},
					{password: hash})
					response.data = new_password;
					response.status = EvResponseStatus.SUCCESS;
			}
		}
		catch (error) {
			Logger.error(error);
			response.status = EvResponseStatus.FAILURE;
		}
		response.beEmitted();
	}

	/* "/PART #channelname" to leave a channel */
	private async executePart(cmd: Command) : Promise<void> {
		let response: EventResponse = new EventResponse ("part", 
			cmd.getUser ().getSocket ());

		const channel_name = cmd.getArgs ()[0];
		if (!channel_name) {
			response.status = EvResponseStatus.NO_CHANNEL_GIVEN;
			return response.beEmitted();
		}
		let channel: Channel = await this.channelsService.getChannel (channel_name);
		if (!channel) {
			response.status = EvResponseStatus.NO_SUCH_CHANNEL;
			return response.beEmitted();
		}
		if (channel.hasOwnProperty('owner') && cmd.getUser().userID === channel.owner) {
			response.status = EvResponseStatus.OWNER_TRIES_TO_LEAVE;
			return response.beEmitted();
		}
		const channel_members = channel.members && channel.members.split(",") || [];
		let isUserInChannel: boolean = false;
		let index = -1;
		let user : User = cmd.getUser();
		for (let member of channel_members) {
			index++;
			if (parseInt(member, 10) === user.userID) {
				isUserInChannel = true;
				break ;
			}
		}
		if (!isUserInChannel) {
			response.status = EvResponseStatus.USER_IS_NOT_IN_CHAT;
			return response.beEmitted();
		}
		try {
			const user_chats = user.chats && user.chats.split(",") || [];
			const channelIDString = '#' + channel.channelID.toString();
			const index_user_chats = user_chats.indexOf(channelIDString);
			user_chats.splice(index_user_chats, 1);
			await this.usersService.updateUsers(
				{ userID: user.userID },
				{ chats: user_chats.join(',') }
			)
			
			channel_members.splice(index, 1);
			await this.channelsService.updateChannels(
				{ channelID: channel.channelID },
				{ members: channel_members.join(',') }
			)
			
			const channel_admins = channel.admins && channel.admins.split(",") || [];
			let user_to_kick_is_admin: boolean = false;
			let index_is_admin = -1;
			for (let admin_ID  of channel_admins){
				index_is_admin++;
				if (parseInt(admin_ID,10) === user.userID){
					user_to_kick_is_admin = true;
					break;
				}
			}
			if (user_to_kick_is_admin)
			{
				channel_admins.splice(index_is_admin, 1);
				await this.channelsService.updateChannels(
					{ channelID: channel.channelID },
					{ admins: channel_admins.join(',') }
				)
			}
			//--------------------
			response.data = channel.name;
			response.status = EvResponseStatus.SUCCESS;
		} catch (error) {
			Logger.error(error);
			response.status = EvResponseStatus.FAILURE;
		}
		let newchannel: Channel = await this.channelsService.getChannel(channel_name);
		response.beEmitted();
		await this.sendRefreshMembers(channel_members, cmd.getUser().username, newchannel);
	}

	/////////////////////////////////////////////////
	/// utils
	/////////////////////////////////////////////////

	getTime(): string {

		const date: Date  = new Date ();
		
		let hours = date.getHours ();
		let minutes = date.getMinutes ();
		let seconds = date.getSeconds ();

		return `${hours}:${minutes}:${seconds}`;
	}

	private async hashPassword(password: string): Promise<string> {
		const bcrypt = require('bcrypt');
		return new Promise<string>((resolve, reject) => {
			bcrypt.hash(password, 10, (err: Error | null, hash: string) => {
				if (err) {
					reject(err);
				} else {
					resolve(hash);
				}
			});
		});
	}

	private async sendRefreshMembers(members: string[], callingUser: string, channel: Channel) {
		let users : User[] = [];
		for (let member of members) {
			const user = await this.usersService.getUserByID(Number.parseInt(member));
			users.push(user);
		}
		for (let member of members) {
			const user = await this.usersService.getUserByID(Number.parseInt(member));
			for (const [socket, username] of this.users.entries()) {
				if ((callingUser === "" || callingUser !== username) && user.username === username) {
					const responseData = {
						"members": users,
						"onChannel": channel
					};
					socket.emit("refreshMembers", JSON.stringify(responseData));
				}
			}
		}
	}

	private async sendDeleteChannel(members : string[], channelName : string, callingUser : string, cmdName : string) {
		for (let member of members) {
			const user = await this.usersService.getUserByID(Number.parseInt(member));
			for (const [socket, username] of this.users.entries()) {
				if (username !== callingUser && username === user.username) {
					const responseData = {
						"data": channelName,
						"cmd": cmdName
					};
					socket.emit("deleteChannelFromOthers", JSON.stringify(responseData));
				}
			}
		}
	}

	private async sendInvite(cmdUser: User, invitedUsername: string) {
		for (const [socket, username] of this.users.entries()) {
			if (username === invitedUsername) {
				const responseData = {
					"username": cmdUser.username
				}
				socket.emit("sendInvite", JSON.stringify(responseData));
			}
		}
	}

	private async sendAccept(inviteHost: string, invitedUser: string) {
		for (const [socket, username] of this.users.entries()) {
			if (username === inviteHost) {
				const responseData = {
					"invitedUser": invitedUser
				}
				socket.emit("sendAccept", JSON.stringify(responseData));
			}
		}
	}

	private async sendRefreshMessages(cmdUser : User, channel: Channel) {
		for (const [socket, username] of this.users.entries()) {
			if (username === cmdUser.username) {
				const responseData = {
					"blockedUsers": cmdUser.blocked,
					"channel": channel
				}
				socket.emit("refreshMessages", JSON.stringify(responseData));
			}
		}
	}
}
