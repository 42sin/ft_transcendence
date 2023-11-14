import { ChatsComponent } from "src/app/features/chats/chats.component"
import { SocketService } from "../socket.service"
import { EventResponse } from "../../../../../../server/src/api/chat/utils/EventResponse"
import {User } from '../../../../../projects/models/user.interface'

export function onConnect(socketService: SocketService) {
	console.log ("client: connected to server")
	const user: User = socketService.apiService.getUser();

	if (user)
		socketService.socket.emit ("login", { username: user.username })
	socketService.isSocketConnected = true;
}

export function onDisconnect(socketService: SocketService)
{
	console.log ("client: disconnected to server")
	socketService.isSocketConnected = false;
	socketService.isSocketLoggedIn = false;
}

export function onConnectError(error: any)
{
	console.error (error)
}

export function onLogin(response: string, socketService: SocketService)
{
	let eventResponse: EventResponse;

	eventResponse = JSON.parse (response);
	if (!eventResponse.success)
	{
		return console.error ("error logging in")
	}
	socketService.username = eventResponse.data.username;
	socketService.isSocketLoggedIn = true;
	console.log ("client: logged in as " + socketService.username);
}