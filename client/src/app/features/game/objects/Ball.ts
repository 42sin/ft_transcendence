import { core } from "@angular/compiler";
import { Vector } from "../containers/Vector";
import { AObject, Type } from "./AObject";
import { Paddle } from "./Paddle";

export class Ball extends AObject {

	public static readonly radius: number = 15;

	private readonly ballImage1: HTMLImageElement;
	private readonly ballImage2: HTMLImageElement;

	constructor (canvas: HTMLCanvasElement, private vector: Vector, private selectedMap: string) {

		super (
			canvas,
			canvas.width / 2,
			canvas.height / 2,
			10,
			'#00000000'
			)
		
		this.ballImage1 = new Image();
    	this.ballImage1.src = '../assets/Austronat.png';
		
		this.ballImage2 = new Image();
    	this.ballImage2.src = '../assets/Planet.png';
	}

	render (): void{
		const ctx = this.canvas.getContext ("2d");
		if (!ctx)
			return console.error ("failed to get context");
		if (this.selectedMap === 'Classic')
		{
			ctx.beginPath ()
			ctx.fillStyle = this.fillStyle;
			ctx.arc (this.x, this.y, Ball.radius, 0, 2 * Math.PI)
			ctx.fill ()
			ctx.lineWidth = 1.5
			ctx.strokeStyle = '#ffffff'
			ctx.shadowColor = '#ffffff'
			ctx.shadowBlur = 30
			ctx.stroke ()
			ctx.closePath ()
		}
		if (this.selectedMap === 'Spaceship')
		{
			ctx.drawImage(
				this.ballImage1,
				this.x - Ball.radius,
				this.y - Ball.radius,
				Ball.radius * 4,
				Ball.radius * 4
			  );
		}
		if (this.selectedMap === 'Galaxy')
		{
			ctx.drawImage(
				this.ballImage2,
				this.x - Ball.radius,
				this.y - Ball.radius,
				Ball.radius * 3,
				Ball.radius * 3
			  );
		}
	}

	type(): Type {
		return Type.Ball;
	}

	willCollide (dir: Vector, paddleLeft: Paddle|null, paddleRight: Paddle|null): boolean {

		if (!paddleLeft || !paddleRight)
		{
			console.error ("failed to get paddles when checking for possible ball collision")
			return false;
		}

		/** walls */
		if (dir.y < 0 && this.y - Ball.radius <= 0)
		{
			this.y = Ball.radius;
			return true;
		}
		else if (dir.y > 0 && this.y + Ball.radius >= this.canvas.height)
		{
			this.y = this.canvas.height - Ball.radius;
			return true;
		}
		/** paddleLeft */
		else if (dir.x < 0
			&& this.x - Ball.radius <= paddleLeft.getX () + Paddle.width
			&& this.isWithinPaddleReach (paddleLeft))
		{
			this.x = paddleLeft.getX () + Paddle.width + Ball.radius;
			return true;
		}
		/** paddleRight */
		else if (dir.x > 0
			&& this.x + Ball.radius >= paddleRight.getX ()
			&& this.isWithinPaddleReach (paddleRight))
		{
			this.x = paddleRight.getX () - Ball.radius;
			return true;
		}
		return false;
	}

	private isWithinPaddleReach (paddle: Paddle): boolean {

		const topBall: number = this.y - Ball.radius;
		const bottomBall: number = this.y + Ball.radius;

		const topPaddle = paddle.getY ();
		const bottomPaddle = paddle.getY () + Paddle.height;

		/** using logic of intervals/set of numbers, bzw pixels */
		if ((topBall >= topPaddle && topBall <= bottomPaddle)
			|| (bottomBall >= topPaddle && bottomBall <= bottomPaddle))
			return true;

		return false;
	}

	getVector (): Vector { return this.vector; }

	setVector (nVector: Vector): void { this.vector = nVector; }

	deflect (dir: Vector, paddleLeft: Paddle|null, paddleRight: Paddle|null): Vector
	{
		if (!paddleLeft || !paddleRight)
		{
			console.error ("failed to get paddles when checking for possible ball collision")
			return dir;
		}

		/** top wall or bottom wall deflexion */
		if ((dir.y < 0 && this.y - Ball.radius <= 0)
			|| (dir.y > 0 && this.y + Ball.radius >= this.canvas.height))
			return new Vector (dir.x, -dir.y);

		/** left paddle collision deflexion */
		else if (dir.x < 0
			&& this.x - Ball.radius <= paddleLeft.getX () + Paddle.width
			&& this.isWithinPaddleReach (paddleLeft))
			return this.calcDeflexion (dir, paddleLeft);

		/**right paddle collision deflexion */
		else if (dir.x > 0
			&& this.x + Ball.radius >= paddleRight.getX ()
			&& this.isWithinPaddleReach (paddleRight))
			return this.calcDeflexion (dir, paddleRight);

		return dir;
	}

	/** Calculate deflexion vector based on:
	 * - hit location on paddle: paddle create an axis of symmetry 
	 * (middle is 0, top end max y -1, bottom end max y 1)
	 * - original ball movement Vector
	*/
	private calcDeflexion (dir: Vector, paddle: Paddle): Vector
	{
		// consider ball vector, hit location on paddle
		const mid = paddle.getY () + Paddle.height / 2;
		let nY;
		
		let proportion = (this.y - paddle.getY ()) / (mid - paddle.getY ());
		nY = proportion * (0 + 1) - 1;

		return new Vector (-dir.x, nY);
	}

	hasScored (): boolean
	{
		if (this.x <= Ball.radius
			|| this.x >= this.canvas.width - Ball.radius)
			return true;

		return false;
	}
}