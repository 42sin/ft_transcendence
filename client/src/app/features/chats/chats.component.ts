import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { onConnect, onConnectError, onDisconnect } from 'src/app/core/socket/event-handlers/connect-event-handlers';
import { onTalk_to, onError, onJoin, onMsg, onInvite, onDelete, onKick, onBan, onMute, onUnblock, onBlock, onAdd_admin, onChange_password, onPart, onDeleteChannelFromUi, onRefreshMembers, onRefreshMessages, onSendInvite, onAccept, onSendAccept} from 'src/app/core/socket/event-handlers/runtime-event-handlers';
import { concatMap, take, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChatsUiController } from './chats.ui.controller';
import { EvResponseStatus } from '../../../../../server/src/api/chat/utils/EventResponse';
import { SocketService } from 'src/app/core/socket/socket.service';
import { User } from '../../../../projects/models/user.interface'
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent implements OnInit, OnDestroy  {

	eventHandlersIsset: boolean;
	uiController: ChatsUiController;
	user!: User;
	username: string = '';
	secret: number = 0;
	subs$ = new Subject();
	constructor (public httpClient: HttpClient, public socketService: SocketService, public router: Router) {
		this.uiController = new ChatsUiController (this)
		this.eventHandlersIsset = false;
	}

	ngOnInit(): void {
		this.socketService.apiService.getMyProfile().pipe(
			takeUntil(this.subs$)
		).subscribe( res => {
			this.user = res;
			this.username = this.user.username;
			if (this.user.chats){
			 console.log(this.user.chats)
				this.uiController.loadChats(this.user.chats);

			}
			this.uiController.activateUi ();
			this.setRuntimeEventHandlers ();
		})
	}
	ngOnDestroy(): void {
		// this.user = null;
		this.subs$.next(null);
		this.subs$.complete();
	}
	setRuntimeEventHandlers () {
		this.socketService.socket.on ("join", (response: string ) => onJoin (this, response))
		this.socketService.socket.on ("error", (response: string) => onError (this, response))
		this.socketService.socket.on ("msg", (response: string) => onMsg (this, response))
		this.socketService.socket.on ("talk_to", (response: string) => onTalk_to (this, response))
		this.socketService.socket.on ("invite", (response: string) => onInvite (this, response))
		this.socketService.socket.on ("delete", (response: string) => onDelete (this, response))
		this.socketService.socket.on ("kick", (response: string) => onKick (this, response))
		this.socketService.socket.on ("ban", (response: string) => onBan (this, response))
		this.socketService.socket.on ("mute", (response: string) => onMute (this, response))
		this.socketService.socket.on ("block", (response: string) => onBlock (this, response))
		this.socketService.socket.on ("unblock", (response: string) => onUnblock (this, response))
		this.socketService.socket.on ("add_admin", (response: string) => onAdd_admin (this, response))
		this.socketService.socket.on ("change_password", (response: string) => onChange_password (this, response))
		this.socketService.socket.on ("part", (response: string) => onPart (this, response))
		this.socketService.socket.on ("deleteChannelFromOthers", (response: string) => onDeleteChannelFromUi (this, response))
		this.socketService.socket.on ("refreshMembers", (response: string) => onRefreshMembers (this, response))
		this.socketService.socket.on ("refreshMessages", (response: string) => onRefreshMessages (this, response))
		this.socketService.socket.on ("sendInvite", (response: string) => onSendInvite (this, response));
		this.socketService.socket.on ("accept", (response: string) => onAccept( this, response));
		this.socketService.socket.on ("sendAccept", (response: string) => onSendAccept (this, response));
	}

	// utility
	getUsername (): string {
		return this.username
	}

	getUser (): User {
		return this.user
	}

	getTime(): string {
		const date: Date = new Date ();

		let hours = date.getHours ();
		let minutes = date.getMinutes ();
		let seconds = date.getSeconds ();
		return `${hours}:${minutes}:${seconds}`;
	}
	
	decode (status: EvResponseStatus): string {
		switch (status)
		{
			case EvResponseStatus.NO_SUCH_CMD:
				return "no such command";
			case EvResponseStatus.INVALID_ARGS_COUNT:
				return "invalid number of arguments";
			case EvResponseStatus.INCOMPLETE_REQUEST:
				return "incomplete request";
			case EvResponseStatus.USER_ALREADY_ON_CHANN:
				return "already on channel";
			case EvResponseStatus.INVALID_CHANNNAME:
				return "invalid channel name";
			case EvResponseStatus.NO_CHANNEL_GIVEN:
				return "missing #channel_name"
			case EvResponseStatus.NO_USER_GIVEN:
				return "missing user_name"
			case EvResponseStatus.INTERNAL_SERVER_ERROR:
				return "internal/server error";
			case EvResponseStatus.NO_SUCH_USER:
				return "no such user";
			case EvResponseStatus.USER_ALREADY_ADDED:
				return "user already added";
			case EvResponseStatus.USER_IS_BANNED:
				return "you are banned :/!";
			case EvResponseStatus.PROTECTED_CHANN_ACCESS_DENIED:
				return "access denied to protected channel";
			case EvResponseStatus.PRIVATE_CHANN_ACCESS_DENIED:
				return "can't join hidden channel";
			case EvResponseStatus.CHANN_INVALID_KEY:
				return "invalid key";
			case EvResponseStatus.USER_NOT_AVAILABLE:
				return "the user is not available";
			case EvResponseStatus.USER_DID_NOT_ACCEPT:
				return "the user does't want to play with you :(";
			case EvResponseStatus.USER_IS_NOT_OWNER:
				return "You're not the owner of channel";
			case EvResponseStatus.USER_IS_YOURSELF:
				return "You can not give yourself as user_name"
			case EvResponseStatus.NO_SUCH_CHANNEL:
				return "No such channel";
			case EvResponseStatus.USER_IS_NOT_IN_CHAT:
				return "you're not in the channel";
			case EvResponseStatus.USER_IS_NOT_ADMIN:
				return "you don't have admin rights";
			case EvResponseStatus.FAILURE:
				return "FAILURE";
			case EvResponseStatus.SUCCESS:
				return "request success";
			case EvResponseStatus.USER_HAS_BLOCKED_YOU:
				return "User has blocked you";
			case EvResponseStatus.USER_IS_MUTED:
				return "You are muted -.-!";
			case EvResponseStatus.USER_IS_BLOCKED:
				return "User is blocked";
			case EvResponseStatus.USER_TO_ADD_IS_NOT_IN_CHAT:
				return "The user to add as admin is not in the Chat";
			case EvResponseStatus.USER_TO_KICK_IS_NOT_IN_CHAT:
				return "The user to kick is not in the Chat";
			case EvResponseStatus.USER_TO_MUTE_IS_NOT_IN_CHAT:
				return "The user to mute is not in the Chat";
			case EvResponseStatus.USER_TO_BAN_IS_NOT_IN_CHAT:
				return "The user to ban is not in the Chat";
			case EvResponseStatus.USER_TO_KICK_IS_OWNER:
				return "You can't kick the owner of the chat";
			case EvResponseStatus.USER_TO_BAN_IS_OWNER:
				return "You can't ban the owner of the chat";
			case EvResponseStatus.INVALID_MINUTES_TO_MUTE:
				return "The amount of minutes you want to mute should be a interger > 0";
			case EvResponseStatus.USER_IS_ALREADY_MUTED:
				return "The user is already muted";
			case EvResponseStatus.NO_PASSWORD_SET:
				return "No password set for this channel!";
			case EvResponseStatus.OWNER_TRIES_TO_LEAVE:
				return "Owners can't leave their own channel, try /DELETE";
			case EvResponseStatus.USER_ALREADY_BLOCKED:
				return "You already blocked this user!";
			case EvResponseStatus.NOT_INVITED:
				return "You have not been invited";
		}
		return "request failure";
	}
}