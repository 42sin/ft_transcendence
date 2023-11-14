import { UrlFactory } from "src/app/static/url.factory";
import { ChatsComponent } from "./chats.component";
import { Channel } from "../../../../../server/src/api/channels/channel.entity";
import { User } from "../../../../../server/src/api/users/user.entity";
import { Message } from "../../../../../server/src/api/messages/message.entity";
import { ChatElement } from "./elements/chat.element";
import { MessageElement } from "./elements/message.element";
import { Observable, forkJoin, switchMap } from "rxjs";

export class ChatsUiController {

	uiIsActive: boolean = false;
	alertMessage: string = "";
	confirmMessage: string = "";
	recipient: string = "";
	chats: ChatElement[] = [];
	messages: MessageElement[] = [];
	members: User[] = [] ;
	admins: User[] = [] ;

	constructor (private component: ChatsComponent) {}

	activateUi () {
		if (this.uiIsActive)
			return ;

		const input = document.getElementById ("input") as HTMLInputElement
		if (!input)
			return console.error ("failed to find elem")
		
		input.addEventListener ("keydown", (event) => {
			if (this.uiIsActive && event.key === 'Enter' && input.value)
			{
				if (input.value[0] == '/' || !this.recipient)
					this.component.socketService.socket.emit ("request", {
						input: input.value,
						recipient: this.recipient
					})
				else
				{
					this.component.socketService.socket.emit ("msg", {
						message: input.value,
						sender: this.component.getUsername (),
						recipient: this.recipient
					})
				}
				input.value = ''
			}
		})

		this.uiIsActive = true;
	}

	deactivateUi () { this.uiIsActive = false }

	alert(message: string) {
		this.alertMessage = "! " + message;
		this.uiIsActive = false;
	
		setTimeout(() => {
			this.uiIsActive = true;
			this.alertMessage = '';
		}, 2200);
	}

	confirm(message: string) {
		this.confirmMessage= message;
		this.uiIsActive = false;
	
		setTimeout(() => {
			this.uiIsActive = true;
			this.confirmMessage = '';
		}, 2200);
	}

	loadChats (chats: string)
	{
		let chatIDs: string[] 
		let ID: number
		let isChannel: boolean
		let routePath: string
		let url: string 
		
		chatIDs = chats.split (",");
		for (let chatID of chatIDs)
		{
			isChannel = chatID[0] === '#';
			//
			routePath = "users/id";
			if (isChannel)
			{
				chatID = chatID.substring (1);
				routePath = "channels"
			}
			ID = parseInt (chatID);
			url = UrlFactory.buildUrl (routePath, [ID]);

			((constIsChannel: boolean) => {
			  
				this.component.httpClient.get(url).subscribe({
				  next: (value: any) => {
					if (constIsChannel) {
					  this.chats.unshift(new ChatElement(value as Channel));
					}
					else {
						this.chats.unshift(new ChatElement(value as User));
					}
				  },
				  error: (error: any) => {
					console.error(error);
				  },
				});
			  })(isChannel);
		}
	}

	loadChat(chat: ChatElement)
	{
		let name:string = chat.getRecipientName ();
		this.recipient = name;
		const members = chat.getMembers()?.split(',');
		console.log('load chat', this.recipient)
		// console.log(this.members)
		let params: any[] = [];
		if (name[0] != '#')
			params.push ("interlocutor", this.component.getUsername (), name)
		else
		{
			name = name.substring (1)
			params.push ("channel", name)
		}
		const url:string = UrlFactory.buildUrl ("messages", params);
		const urlUsers: string = UrlFactory.buildUrl('users/id', []);
		// this.component.httpClient.get (url).subscribe ({
		// 	next: (value: any) => {
		// 		this.messages = (value as Message[]).map ((message: Message) => new MessageElement (message))
		// 	},
		// 	error: (error: any) => {
		// 		console.log ("error: " + error)
		// 	}
		// });
		if (members && members?.length)	{
			this.component.httpClient.get(url).subscribe({
				next: (value: any) => {
					this.messages = (value as Message[]).map ((message: Message) => new MessageElement (message))
					this.messages = this.messages.filter((message) => {
						const senderID = message.getMessage().senderID;
						return !this.component.getUser().blocked.includes(senderID);
					});
					const memberUrls = members.map(id => `${urlUsers}/${id}`)
					const reqs: Observable<User>[] = [];
					memberUrls.map(url => {
							const user = this.component.httpClient.get<User>(url, {
							withCredentials: true
						});
						reqs.push(user)
					});
					forkJoin(reqs).subscribe({
						next: (users: User[]) =>	{
							this.members = users
						},
						error: (error: any) =>{
							console.log ("error: " + error)
						}
					})
				},
				error: (error: any) =>	{
					console.log('Error: ', error)
				}
			})
		}	else {
			this.component.httpClient.get (url).subscribe ({
				next: (value: any) => {
					this.messages = (value as Message[]).map ((message: Message) => new MessageElement (message))
					this.messages = this.messages.filter((message) => {
						const senderID = message.getMessage().senderID;
						return !this.component.getUser().blocked.includes(senderID);
					});
				},
				error: (error: any) => {
					console.log ("error: " + error)
				}
			});
		}
	}
}