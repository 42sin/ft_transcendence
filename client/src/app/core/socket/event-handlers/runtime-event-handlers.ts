import { ChatsComponent } from "src/app/features/chats/chats.component";
import { EvResponseStatus, EventResponse } from "../../../../../../server/src/api/chat/utils/EventResponse";
import { Message } from "../../../../../../server/src/api/messages/message.entity";
import { MessageElement } from "src/app/features/chats/elements/message.element";
import { ChatElement } from "src/app/features/chats/elements/chat.element";
import { Channel } from "../../../../../../server/src/api/channels/channel.entity";
import { User } from "../../../../../../server/src/api/users/user.entity";
import { GameComponent } from "src/app/features/game/game.component";


export function onMsg (component: ChatsComponent, response: string)
{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse (response)
	if (!eventResponse.success)
		return component.uiController.alert (component.decode (eventResponse.status));
	const message: Message = eventResponse.data.messageEntity as Message;
	if (eventResponse.data.recipient == component.getUsername ()
		|| component.uiController.recipient == eventResponse.data.recipient
		||  eventResponse.data.sender == component.getUsername ())
	{
		const messageElement: MessageElement = new MessageElement (message);
		component.uiController.messages.push (messageElement)
	}
}

export function onError(component: ChatsComponent, response: string)
{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse (response)
	component.uiController.alert (component.decode (eventResponse.status))
}

/* Join to a Chat. If it doesn't exist, it creates it, 
/JOIN + #nameChannel + #optionalPassword */
export function onJoin(component: ChatsComponent, response: string)
{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse (response)
	if (!eventResponse.success)
		return component.uiController.alert(component.decode(eventResponse.status));
	const chat: ChatElement = new ChatElement(eventResponse.data as Channel)
	component.uiController.chats.unshift (chat)
	component.uiController.loadChat (chat)
}

/* Send a private msg to someone,
/TALK_TO + username */ 
export function onTalk_to(component: ChatsComponent, response: string)
{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse (response)
	if (!eventResponse.success)
		return component.uiController.alert(component.decode(eventResponse.status));
	const chat: ChatElement = new ChatElement (eventResponse.data as Channel)
	component.uiController.chats.unshift (chat)
	component.uiController.loadChat (chat)
}

/* Invite a User to play a Game */
export function onInvite(component: ChatsComponent, response: string)
{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse (response)
	console.log(eventResponse.status)
	if (!eventResponse.success)
		return component.uiController.alert(component.decode(eventResponse.status));
	// Create an instance of the GameComponent and start the game
	const username_invited = eventResponse.data //use the route of this player..
	//I add route and router in the Chatcomponent, not sure this routeand router 
	//is what i need to call the game. and now how I start it?
	//const gameComponent = new GameComponent();
	//GameComponent - start!
	const message = "You invited " + username_invited + ' to play a game!\nPlease be patient!';
	return component.uiController.confirm(message)
	// username_invited, user.username)
	//return component.uiController.alert (component.decode (eventResponse.status)); //remoeve later
}

export function onSendInvite(component: ChatsComponent, response: string) {
	const eventResponse = JSON.parse(response);
	return component.uiController.confirm(eventResponse.username + ' invited you to a game!\nIf you want to accept type /ACCEPT [USERNAME]');
}

export function onAccept(component: ChatsComponent, response: string) {
	let eventResponse: EventResponse;
	eventResponse = JSON.parse(response);
	console.log(eventResponse.status);
	if (!eventResponse.success)
		return component.uiController.alert(component.decode(eventResponse.status));
	component.uiController.confirm('Successfully accepted invitation! You can meet him in the waiting room!');
}

export function onSendAccept(component: ChatsComponent, response:string) {
	const eventResponse = JSON.parse(response);
	const invitedUser = eventResponse.invitedUser;
	component.uiController.confirm(invitedUser + ' accepted your invitation! Go meet in the waiting room!');
}

/* Delete Channel*/
export function onDelete(component: ChatsComponent, response: string)
{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse (response)
	console.log(eventResponse.status)
	if (!eventResponse.success)
		return component.uiController.alert(component.decode(eventResponse.status));

	//Add funcionality here
	
	// component.ngOnInit();
	//just for info:
	const leftChannel = eventResponse.data;
	if (!deleteFromUi(component, leftChannel))
		return ;
	return component.uiController.confirm("successfully deleted the channel " + leftChannel + '!');
}

/* Kick user from a Chat (only admins  of the Chat can do it) */
export function onKick(component: ChatsComponent, response: string)
{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse (response)
	console.log(eventResponse.status)
	if (!eventResponse.success)
		return component.uiController.alert(component.decode(eventResponse.status));

	//Add funcionality here
	
	//just for info:
	const username_to_kick = eventResponse.data
	const message = "you kicked " + username_to_kick
	return component.uiController.confirm(message)
}

/* Ban user from a Chat (only admins  of the Chat can do it) - kick if is in the chat
+ the user can't join anymore */
export function onBan(component: ChatsComponent, response: string)
{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse (response)
	console.log(eventResponse.status)
	if (!eventResponse.success)
		return component.uiController.alert(component.decode(eventResponse.status));

	//Add funcionality here
	
	//just for info:
	const username_to_ban = eventResponse.data
	const message =  "you banned " + username_to_ban
	return component.uiController.confirm(message)
}

/* Mude a user in a Chat temporarily (only admins  of the Chat can do it)*/
export function onMute(component: ChatsComponent, response: string)
{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse (response)
	console.log(eventResponse.status)
	if (!eventResponse.success)
		return component.uiController.alert(component.decode(eventResponse.status));

	//Add funcionality here
	
	//just for info:
	const username_to_mute = eventResponse.data
	const message =  "you muted " + username_to_mute
	return component.uiController.confirm(message)
}

/* Block a user so she/he can't send msgs (only privates?)*/
export function onBlock(component: ChatsComponent, response: string)
{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse (response)
	console.log(eventResponse.status)
	if (!eventResponse.success)
		return component.uiController.alert(component.decode(eventResponse.status));

	//Add funcionality here
	
	//--------------------------------------
	const username_to_block = eventResponse.data
	const message =  "you blocked " + username_to_block
	component.uiController.messages = component.uiController.messages.filter((message) => {
		const senderID = message.getMessage().senderID;
		return !component.getUser().blocked.includes(senderID);
	});
	return component.uiController.confirm(message)
}

/* Unblock a user so she/he can send msgs again*/
export function onUnblock(component: ChatsComponent, response: string)
{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse (response)
	console.log(eventResponse.status)
	if (!eventResponse.success)
		return component.uiController.alert(component.decode(eventResponse.status));

	//Add funcionality here
	
	//just for info:
	const username_to_unblock = eventResponse.data
	const message =  "you unblocked " + username_to_unblock
	return component.uiController.confirm(message)
}
/*
//ADD_ADMIN #channelname username
 */
export	function onAdd_admin(component: ChatsComponent, response: string)	{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse(response);
	console.log(eventResponse.status);
	if (!eventResponse.success)	{
		return component.uiController.alert(component.decode(eventResponse.status));
	}
	//confirmation??
	const userToAdd = eventResponse.data;
	const message = userToAdd + ' was added to admin list';
	return component.uiController.confirm(message);
}

/* CHANGE/ADD/REMOVE PASSWORD OF A CHANNEL ONLY FOR OWNER!
   "/CHANGE_PASSWORD #channelname [password]" TO ADD/CHANGE
   "/CHANGE_PASSWORD #channelname" TO REMOVE */
export function onChange_password(component: ChatsComponent, response: string) {
	let eventResponse: EventResponse;

	eventResponse = JSON.parse(response);
	console.log(eventResponse.status);
	if (!eventResponse.success) {
		return component.uiController.alert(component.decode(eventResponse.status));
	}
	const newPassword = eventResponse.data;
	let message : string;
	if (newPassword === "") {
		message = 'Channel password was succesfully removed!';
	}
	else {
		message = newPassword + ' was set as channel password';
	}
	return component.uiController.confirm(message);
}

/* LEAVE A CHANNEL
	"/PART #CHANNELNAME" */
	export function onPart(component: ChatsComponent, response: string ) {
		let eventResponse: EventResponse;
	
		eventResponse = JSON.parse(response);
		console.log(eventResponse.status);
		if (!eventResponse.success) {
			return component.uiController.alert(component.decode(eventResponse.status));
		}
		const leftChannel = eventResponse.data;
		if (!deleteFromUi(component, leftChannel))
			return ;
		component.uiController.confirm('successfully left the channel ' + leftChannel + '!');
	}

	export function onRefreshMembers(component: ChatsComponent, response: string) {
		const eventResponse = JSON.parse(response);
		const chat: ChatElement = new ChatElement(eventResponse.onChannel as Channel);
		const existingChat = component.uiController.chats.find(existingChat => existingChat.isEqual(chat));
		if (existingChat) {
			const chatIndex = component.uiController.chats.indexOf(existingChat);
			component.uiController.chats[chatIndex] = chat;
		}
		if (component.uiController.recipient == eventResponse.onChannel.name) {
			component.uiController.loadChat(chat);
		}
	}

	export function onRefreshMessages(component: ChatsComponent, response: string) {
		const eventResponse = JSON.parse(response);
		component.user.blocked = eventResponse.blockedUsers;

		const channel = eventResponse.channel;
		if (channel && channel.name == component.uiController.recipient) {
			const chat: ChatElement = new ChatElement(channel as Channel);
			component.uiController.loadChat(chat);
		}
	}

	export function onDeleteChannelFromUi(component: ChatsComponent, response: string) {
		const eventResponse = JSON.parse(response);
		const leftChannel = eventResponse.data;
		const cmdName = eventResponse.cmd;
		if (!deleteFromUi(component, leftChannel))
			return ;
		let message : string = "You left a channel"
		if (cmdName == "DELETE") {
			message = 'Channel ' + leftChannel + ' got deleted!';
		}
		else if (cmdName == "KICK") {
			message = 'You got kicked from ' + leftChannel + '!';
		}
		else if (cmdName == "BAN") {
			message = 'You got banned from ' + leftChannel + '!';
		}
	return component.uiController.alert(message);
	}

	/* UTILS */
	export function deleteFromUi (component: ChatsComponent, leftChannel: string): boolean {
		let indexChat = 0;
		for (let chat of component.uiController.chats) {
			if (chat.getRecipientName() == leftChannel) {
				break ;
			}
			indexChat++;
		}
		if (indexChat > component.uiController.chats.length) {
			return false;
		}
		if (component.uiController.recipient == leftChannel) {
			component.uiController.messages = [];
			component.uiController.members = [];
			component.uiController.recipient = "";
		}
		component.uiController.chats.splice(indexChat, 1);
		return true;
	}
