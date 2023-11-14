import { Component } from '@angular/core';
import { SocketService } from './core/socket/socket.service';
import { InitializedRelationError } from 'typeorm';
import { onConnect, onConnectError, onDisconnect, onLogin } from './core/socket/event-handlers/connect-event-handlers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	constructor (private socketService: SocketService) {
		this.initializeClientSocket ();
	}

	initializeClientSocket () {
		this.socketService.socket.connect (); 
		if (!this.socketService.socket)
			return console.error ("failed to instantiate socket")
		this.socketService.socket.on ("connect", () => onConnect (this.socketService))
		this.socketService.socket.on ("connect_error", (error: any) => onConnectError(error))
		this.socketService.socket.on ("disconnect", () => onDisconnect (this.socketService))
		this.socketService.socket.on ("login", (response: string) => onLogin (response, this.socketService))
	}
}
