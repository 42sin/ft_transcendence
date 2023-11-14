import { Injectable } from "@angular/core";
import { ApiService } from "projects/tools/src/lib/services/api.service";
import { Socket, io } from "socket.io-client";
import { UrlFactory } from "src/app/static/url.factory";

@Injectable({
	providedIn: 'root'
})
export class SocketService {
	public readonly socket: Socket = io (UrlFactory.BASE_URL + ":" + UrlFactory.PORT + '/chat');

	public isSocketConnected = false;
	public isSocketLoggedIn = false;
	public username: string | null = null;

	constructor(readonly apiService: ApiService)
	{
	}
}
