import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'projects/tools/src/lib/services/api.service';
import { SocketService } from 'src/app/core/socket/socket.service';
import { EventResponse } from '../../../../../server/src/api/chat/utils/EventResponse';

interface QueueJoinedData
{
	opponent: string,
	playerNumber: number
}
@Component({
  selector: 'waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.css']
})
export class WaitingRoomComponent implements OnInit, OnDestroy
{
	public selectedMap: string = "Classic";
	public playGamePrompt: string = "Play";
	public waitingForOpponent: boolean = false;

	constructor(private router: Router, private apiService: ApiService, private _socketService: SocketService)
	{
	}

	ngOnInit(): void
	{
		if (!this.apiService.getUser())
		{
			this.router.navigate([''])
		}
		if (this._socketService.isSocketConnected && this._socketService.isSocketLoggedIn)
		{
			this.setQueueEventHandlers();
		}
		else
		{
			console.error("Not ready to do some stuff with the socket on WaitingRoomComponent");
		}
	}

	ngOnDestroy(): void
	{
		this._removeEventListeners();
	}

	public selectMap(map: string): void
	{
		this.selectedMap = map;
	}

	public playGame(): void
	{
		if (!this.waitingForOpponent)
		{
			console.log("socket emit queueJoined in playGame")
			// this._socketService.socket.emit ("queueJoined");
			this._setIsWaiting();
		}
		else
		{
			console.log("socket emit queueLeft")
			this.playGamePrompt = "Play";
			this._socketService.socket.emit ("queueLeft",
			{
				sender: this._socketService.username
			});
			this.waitingForOpponent = false;
		}
	}

	private setQueueEventHandlers(): void
	{
		this._socketService.socket.on ("queueJoined", (response: string) => this._onQueueJoined(response));
	}

	private _setIsWaiting()
	{
		this.playGamePrompt = "Waiting for someone to join...Click to cancel";
		this._socketService.socket.emit ("queueJoined",
		{
			sender: this._socketService.username,
			message: this.selectedMap
		});
		this.waitingForOpponent = true;
	}

	private _onQueueJoined(response: string)
	{
		const eventResponse: EventResponse = JSON.parse(response);

		if (eventResponse.success)
		{
			if (eventResponse.data) {
				const data: QueueJoinedData = JSON.parse(eventResponse.data) as QueueJoinedData;
				console.log("Parsed data:", data);
				
				// Now you can access and print specific properties of the data object if needed
				console.log("Opponent:", data.opponent);
				console.error("Player Number:", data.playerNumber);
				let stringplayerNumber: string = ''; // Initialize with an empty string

				if (data.playerNumber === 1) {
  					stringplayerNumber = 'firstP';
				} else if (data.playerNumber === 2) {
  					stringplayerNumber = 'secondP';
				}
				
				// this.router.navigate(['/play'], { queryParams: { map: this.selectedMap, opponent: data.opponent, playerNumber: data.playerNumber } });
				this.router.navigate(['/play'], { queryParams: { map: this.selectedMap, opponent: data.opponent, playerNumber: stringplayerNumber } });
			}
			else
			{
				console.error ("Error: null data on queue joined event");
				console.error(eventResponse);
			}
		}
		else
		{
			console.error ("response failure");
		}
	}

	private _removeEventListeners()
	{
		this._socketService.socket.off("queueJoined", this._onQueueJoined);
	}
}
