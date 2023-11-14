import { Component, OnDestroy, OnInit, resolveForwardRef } from '@angular/core';
import { ApiService } from 'projects/tools/src/lib/services/api.service';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { SocketService } from 'src/app/core/socket/socket.service';
import { EventResponse } from '../../../../../../server/src/api/chat/utils/EventResponse';
import { authGuard } from 'projects/tools/src/lib/guards/auth.guard';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy
{
	public gamePrompt: string = "Create new game";
	public usernameOf42StudentAlreadyInQueue: string|null = null;
	public mapChosenBy42StudentAlreadyInQueue: string|null = null;

 	constructor(private apiService: ApiService, private router: Router, public _socketService: SocketService)
	{
	}

    ngOnInit(): void 
	{
		this.apiService.authStatus();
		if (!this.apiService.getUser())
		{
			this.router.navigate([''])
		}
		if (this._socketService.isSocketConnected && this._socketService.isSocketLoggedIn)
		{
			this.setQueueEventHandlers();
			this._socketService.socket.emit("queueStatus");
		}
		else
		{
			console.error("Not ready to do some stuff with the socket on LobbyComponent");
		}
    }

	ngOnDestroy(): void
	{
		this._removeEventListeners();
	}

	public goToWaitingRoomOrPlayGame(): void
	{
		if (this.usernameOf42StudentAlreadyInQueue)
		{	
			console.log("socket emit queueJoined in goToWaitRoomOrPlayGame")
			this._socketService.socket.emit ("queueJoined",
			{
				sender: this._socketService.username
			});
			// this.router.navigate(['/play'], { queryParams: { map: this.mapChosenBy42StudentAlreadyInQueue, opponent: this.usernameOf42StudentAlreadyInQueue, playerNumber: 2  } });
			this.router.navigate(['/play'], { queryParams: { map: this.mapChosenBy42StudentAlreadyInQueue, opponent: this.usernameOf42StudentAlreadyInQueue, playerNumber: "secondP"  } });
		}
		else
		{
			console.log("Going to waiting room")
			this.router.navigate(['/waiting-room']);
		}
	}

	private _onQueueStatus(response: string)
	{
		const eventResponse: EventResponse = JSON.parse(response);

		if (eventResponse.success && eventResponse.data)
		{
			const data: string = eventResponse.data;

			this.usernameOf42StudentAlreadyInQueue = data.split(",")[0];
			this.mapChosenBy42StudentAlreadyInQueue = data.split(",")[1];
			this.gamePrompt = "Join game with " + this.usernameOf42StudentAlreadyInQueue;
		}
	}

	private setQueueEventHandlers(): void
	{
		this._socketService.socket.on("queueStatus", (response: string) => this._onQueueStatus(response));
	}

	private _removeEventListeners()
	{
		this._socketService.socket.off("queueStatus", this._onQueueStatus);
	}
}
