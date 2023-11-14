import { Component } from '@angular/core';
import { AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Paddle, PaddleType } from './objects/Paddle';
import { Ball } from './objects/Ball';
import { Vector } from './containers/Vector';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { ApiService } from 'projects/tools/src/lib/services/api.service';
import { SocketService } from 'src/app/core/socket/socket.service';
import { EventResponse } from '../../../../../server/src/api/chat/utils/EventResponse';
import { core } from '@angular/compiler';

interface OpponentKeyAction
{
	key: string,
	added: boolean
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy, AfterViewInit
{
	private static _WINNING_SCORE: number = 5; // Set the winning point limit
	private static readonly _KEY_GHOST_TIMEOUT_MS = 80;
	private _paddleStart: Paddle | null = null;
	private _paddleEnd: Paddle | null = null;
	private _ball: Ball | null = null;
	private _canvas: HTMLCanvasElement | null = null;
	private _started: boolean = false;
	// for multiple key event detection
	private _keysPressed: Set<string>;
	// movement keys temporarily ghosted/ignored to prevent extra movement caused by high process speed
	private _keysGhosted: Set<string>;
	private _opponentIsPinged: boolean = false;
	private _animationFrameId: number|null = null;
	private _newVector: Vector|undefined = undefined;
	selectedMap: string = 'Classic';
	opponent: string|null = null;
	// playerNumber: number|null = null;
	playerNumber: string|null = null;
	scoreCurrentPlayer: number = 0;
	scoreOpponent: number = 0;

	constructor(private route: ActivatedRoute, 
		private apiService: ApiService,
		private router: Router, 
		private _socketService: SocketService)
	{
		this._keysPressed = new Set<string>();
		this._keysGhosted = new Set<string>();
		// bind member function properties in class prototype of instance of obj
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
	}

	private _removeEventListeners()
	{
		this._socketService.socket.off("paddleCoordinates", this._handlePaddleCoordinates);
		this._socketService.socket.off("ballCoordinates", this._handleBallCoordinates);
		this._socketService.socket.off("pingOpponent", this._handlePingOpponent);
    this._socketService.socket.off("score", this._handleScore);
	}

	private _attachEventHandlersIfSocketIsReady()
	{
		if (!this._socketService || !this._socketService.isSocketLoggedIn)
		{
			console.error("Socket error at GameComponent");
		}
		this._socketService.socket.on("paddleCoordinates", (response: string) => this._handlePaddleCoordinates(response));
		this._socketService.socket.on("ballCoordinates", (response: string) => {
			// console.log("Received ballCoordinates event with data: " + response);
			// You can also parse the response if it's in JSON format
			// const parsedData = JSON.parse(response);
			// console.log("Parsed data:", parsedData);
			// Now you can work with the data as needed
			this._handleBallCoordinates(response);
		});
		this._socketService.socket.on("pingOpponent", (response: string) => this._handlePingOpponent(response));
    this._socketService.socket.on("score", (response: string) => this._handleScore(response));
	}

	private _handlePaddleCoordinates(response: string)
	{
		const eventResponse: EventResponse = JSON.parse(response);

		if (eventResponse.success && eventResponse.data)
		{
			const opponentKeyAction: OpponentKeyAction = JSON.parse(eventResponse.data) as OpponentKeyAction;

			if (opponentKeyAction.added)
			{
				this._keysPressed.add(opponentKeyAction.key);
			}
			else
			{
				this._keysPressed.delete(opponentKeyAction.key);
			}
		}
	}

	private _handleBallCoordinates(response: string)
	{
		if (this.playerNumber === "secondP")
		{
			const eventResponse: EventResponse = JSON.parse(response);
			if (eventResponse.success && eventResponse.data)
			{
				this._newVector = JSON.parse(eventResponse.data) as Vector;
			}
		}
		else
		{
			console.error("Invalid playerNumber at ballCoordinates event handler AAA: " + this.playerNumber);
		}
	}

	private _handlePingOpponent(response: string)
	{
		const eventResponse: EventResponse = JSON.parse(response);

		if (eventResponse.success && eventResponse.data == this.opponent)
		{
			this._opponentIsPinged = true;
		}
	}

  private _handleScore(response: string) {
		if (this.playerNumber === "secondP")
		{
			const eventResponse: EventResponse = JSON.parse(response);
			if (eventResponse.success && eventResponse.data)
			{
        const scorePair = eventResponse.data.split(',');
        this.scoreCurrentPlayer = parseInt(scorePair[1]);
        this.scoreOpponent = parseInt(scorePair[0]);
			}
		}
		else
		{
			console.error("Invalid playerNumber at Score event handler AAA: " + this.playerNumber);
		}
  }

	ngAfterViewInit()
	{
		this._setMapBackgroundColor();
	}

	private _setMapBackgroundColor()
	{
		const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

		switch (this.selectedMap) {
		case 'Classic':
			canvas.style.backgroundColor = '#1d1d1d';
			canvas.style.border = '3px dotted #00adf7';
			canvas.style.backgroundImage = '';
			break;
		case 'Spaceship':
			canvas.style.backgroundColor = 'transparent';
			canvas.style.border = '5px solid #777777';
			canvas.style.backgroundImage = 'url("../assets/Spaceship.png")';
			break;
			case 'Galaxy':
			canvas.style.backgroundColor = 'transparent';
			canvas.style.border = '3px dotted #675092';
			canvas.style.backgroundImage = 'url("../assets/Galaxy.png")';
			break;
		}
	}
	
	private _emitEventsIfSocketIsReady()
	{
		if (!this._socketService || !this._socketService.isSocketLoggedIn)
		{
			console.error("socket not ready at GameComponent");
		}
		this._socketService.socket.emit ("pingOpponent",
		{
			sender: this._socketService.username,
			recipient: this.opponent
		})
	}

	ngOnInit()
	{
		console.log("ng on init");
		this._attachEventHandlersIfSocketIsReady();
		this.route.queryParams.subscribe(params =>
		{
			console.log (params);
			const map = params['map'];
			if (map)
			{
				this.selectedMap = map;
			}
			if (params["opponent"])
			{
				this.opponent = params["opponent"];
			}
			if (params["playerNumber"])
			{
				this.playerNumber = params["playerNumber"];
			}
			this._emitEventsIfSocketIsReady();
			console.log("***Player number: " + this.playerNumber);
			console.log("***Opponent name: " + this.opponent);
			this._setMapBackgroundColor();
			this.startGame();
		});
	}

	ngOnDestroy()
	{
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('keyup', this.handleKeyUp);
		this._removeEventListeners();
		if (this._animationFrameId)
		{
			cancelAnimationFrame(this._animationFrameId);
		}
	}

	// event listeners callback methods
	private handleKeyDown(event: KeyboardEvent)
	{
		this._keysPressed.add(event.key);
		if (event.key == "ArrowUp")
		{
			this._sendCurrentPlayersPaddleCoordinates("ArrowUpOpp", true);
		}
		else if (event.key == "ArrowDown")
		{
			this._sendCurrentPlayersPaddleCoordinates("ArrowDownOpp", true);
		}
	}

	private handleKeyUp(event: KeyboardEvent)
	{
		this._keysPressed.delete(event.key);
		if (event.key == "ArrowUp")
		{
			this._sendCurrentPlayersPaddleCoordinates("ArrowUpOpp", false);
		}
		else if (event.key == "ArrowDown")
		{
			this._sendCurrentPlayersPaddleCoordinates("ArrowDownOpp", false);
		}
	}

	// game initializer / loop starter
	private async startGame(): Promise<void>
	{
		this.initGame(true);
		// register key pressed
		document.addEventListener('keydown', this.handleKeyDown);
		// deregister key pressed
		document.addEventListener('keyup', this.handleKeyUp);
		this.gameLoop();
	}

	private async initGame(rand: boolean): Promise<void>
	{
		console.error("INIT GAME")
		this._canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
		this._paddleStart = new Paddle(this._canvas, PaddleType.Start, this.selectedMap);
		this._paddleEnd = new Paddle(this._canvas, PaddleType.End, this.selectedMap);
		if (!this._paddleStart || !this._paddleEnd)
		{
			return console.error("failed to initialize paddles");
		}
		const num = Math.random();
		if ((rand && num) || (!rand && this.scoreCurrentPlayer < this.scoreOpponent))
		{
			this._ball = new Ball(this._canvas, new Vector(-1, 0), this.selectedMap);
		}
		else
		{
			this._ball = new Ball(this._canvas, new Vector(1, 0), this.selectedMap);
		}
		this._started = false;
		setTimeout(() =>
		{
			this._started = true;
		}
		,1000);
	}

	// move Paddles, i.e., update coordinates if keys are pressed
	async movePaddles(): Promise<void>
	{
		let keys: Array<string> = ['ArrowUp', 'ArrowDown', 'ArrowUpOpp', 'ArrowDownOpp']; // add keys you want to detect
		let keysIterationIndex: number = -1;
		while (++keysIterationIndex < keys.length)
		{
			if (this._keysPressed.has(keys[keysIterationIndex]) && !this._keysGhosted.has(keys[keysIterationIndex])) // if pressed and not ghosted
			{
				let paddleOfCurrentPlayer = this._paddleStart;
				let paddleOfOpponent= this._paddleEnd;
				if (this.playerNumber !== "firstP")
				{
					paddleOfCurrentPlayer = this._paddleEnd;
					paddleOfOpponent= this._paddleStart;
				}
				switch (keys[keysIterationIndex])
				{
					case 'ArrowUp':
						paddleOfCurrentPlayer?.move(new Vector(0, -1));
						break;
					case 'ArrowDown':
						paddleOfCurrentPlayer?.move(new Vector(0, 1));
						break;
					case 'ArrowUpOpp':
						paddleOfOpponent?.move(new Vector(0, -1));
						break;
					case 'ArrowDownOpp':
						paddleOfOpponent?.move(new Vector(0, 1));
						break;
				}
				// to remove ghost status using IIFE here for its scope to keep value of i on timeout
				this._keysGhosted.add(keys[keysIterationIndex]);
				((key) =>
				{
					setTimeout(() =>
					{
						this._keysGhosted.delete(key);
					}
					,GameComponent._KEY_GHOST_TIMEOUT_MS);
				})(keys[keysIterationIndex]);
			}
		}
	}

	private async _sendCurrentPlayersPaddleCoordinates(key: string, added: boolean): Promise<void>
	{
		let currentPlayersPaddle = this._paddleStart;
		if (!this._socketService || !this._socketService.isSocketLoggedIn)
		{
			console.error("socket error at GameComponent");
		}
		if (this.playerNumber !== "firstP")
		{
			currentPlayersPaddle = this._paddleEnd;
		}
		this._socketService.socket.emit ("paddleCoordinates",
		{
			sender: this._socketService.username,
			recipient: this.opponent,
			message: JSON.stringify({ key: key, added: added })
		});
	}

	// clear and recreate game background
	renderBackground()
	{
		if (!this._canvas)
		{
			return console.error("gameComponent.canvas is null");
		}
		const ctx = this._canvas.getContext("2d");
		if (!ctx)
		{
			return console.error("failed to get context");
		}
		// clear canvas
		ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		// render dotted net
		let y = 0;
		const SPAN = 10;
		while (y < this._canvas.height)
		{
			ctx.beginPath();
			ctx.strokeStyle = 'white';
			ctx.lineWidth = 0.1;
			ctx.moveTo(this._canvas.width / 2, y);
			y += SPAN;
			ctx.lineTo(this._canvas.width / 2, y);
			ctx.stroke();
			ctx.moveTo(0, 0);
			ctx.closePath();
			y += SPAN;
		}
	}

	private async _sendBallCoordinates(): Promise<void>
	{
		if (this._newVector)
		{
			this._socketService.socket.emit("ballCoordinates",
			{
				sender: this._socketService.username,
				recipient: this.opponent,
				message: JSON.stringify(this._newVector)
			});
		}
		// else
		// {
		// 	console.error("Undefined ball at _sendBallCoordinates");
		// }
	}

  private async _sendScore(): Promise<void> {
    // console.log(`transmitting score from HOST: ${this.scoreCurrentPlayer},${this.scoreOpponent}`);
    this._socketService.socket.emit("score",
    {
      sender: this._socketService.username,
      recipient: this.opponent,
      message: `${this.scoreCurrentPlayer},${this.scoreOpponent}`
    });
  }

	/** game runtime logic */
	private async gameLoop(): Promise<void>
	{
		this.renderBackground();
		await this.movePaddles();
		this._paddleStart?.render();
		this._paddleEnd?.render();
		if (!this._started)
		{
		  	this._ball?.render();
		}
		else
		{
			if (this.playerNumber === "firstP")
			{
				// console.log("firstP, new assign to _nwVector")
				this._newVector = await this._ball?.mMove(this._ball.getVector(), this._paddleStart, this._paddleEnd);
				this._sendBallCoordinates();
			}
			else if (this._newVector)
			{
				// console.log("secondP, else of new assign to _nwVector")
				await this._ball?.mMove(this._newVector, this._paddleStart, this._paddleEnd);
			}
			if (this._newVector)
			{
				// console.error("will I increment? playernumber:" + this.playerNumber + " , " + this._newVector);
				if (this._newVector.x === 0 && this._newVector.y === 0) //CHECK
				{
					console.error("increment once: ");
					if (!this._ball || !this._paddleStart || !this._paddleEnd)
					{
						console.error("Undefined object");
					}
					else if (this._ball.getX() < this._paddleStart.getX()) //ball in the left
					{
						if (this.playerNumber === "firstP")
						{
							this.scoreOpponent++;
							console.error("getX<paddleStart increment score opponent " + this.scoreOpponent);
              this._sendScore();
						}

					}
					else //when the ball is int he right
					{
						if (this.playerNumber === "firstP")
						{
							this.scoreCurrentPlayer++;
							console.error("else increment score player " + this.scoreCurrentPlayer);
              this._sendScore();
						}
						// else //secondP
						// {
						// 	this.scoreOpponent++;
						// 	console.error("else increment score opponent " + this.scoreOpponent);
						// }
					}



					// Check for winning condition
					if (this.scoreCurrentPlayer === GameComponent._WINNING_SCORE || this.scoreOpponent === GameComponent._WINNING_SCORE)
					{
						let winner: string|null;
						if (this.scoreCurrentPlayer === GameComponent._WINNING_SCORE) // Player 1 (start) wins
						{
							winner = this._socketService.username;
						}
						else // Player 2 (start) wins
						{
							winner = this.opponent;
						}
						if (this.playerNumber === "firstP" || this.playerNumber === "secondP") // in order for code not to run twice
						{
							// update db wins/loses
							this.apiService.incrementWins(winner, this.opponent, this.scoreCurrentPlayer + ' : ' + this.scoreOpponent).subscribe(response => {
								if (response.success) {
									// Handle success, e.g., show a message or update the UI
								} else {
									// Handle the case where updating the wins failed
								}
								});
						}
						console.log ("winner: " + winner);
						this.router.navigate(['/winner'], { queryParams: { winner: winner } });
						return;
					}
					else
					{
						this.initGame(false);
					}
				}
				else if (this._newVector.x !== this._ball?.getVector().x || this._newVector.y !== this._ball?.getVector().y)
				{
					this._ball?.setVector(this._newVector);
				}
			}
			this._ball?.render();
		}

		this._animationFrameId = requestAnimationFrame(() => this.gameLoop());
	}
	
	public static async delay(ms: number): Promise<void>
	{
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/** method to handle map selection */
	public selectMap(map: string)
	{
		this.selectedMap = map;
		this._setMapBackgroundColor();
		this.initGame(true);
		this.renderBackground();
	}

	public getScore(start: boolean): number 
	{
		if (start)
		{
			if (this.playerNumber === "firstP")
			{
				return this.scoreCurrentPlayer;
			}
			else 
			{
				return this.scoreOpponent;
			}
		}
		else 
		{
			if (this.playerNumber === "firstP")
			{
				return this.scoreOpponent;
			}
			else 
			{
				return this.scoreCurrentPlayer;
			}
		}
	}


	public closePopup(): void {
		let popup : HTMLElement | null = document.getElementById('popupManual');
		if (popup)
			popup.style.display = 'none';
	}
}
