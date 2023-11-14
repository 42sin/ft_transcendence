import { Vector } from '../containers/Vector';
import { AObject, Type } from './AObject'

export enum PaddleType { Start, End }

export class Paddle extends AObject {

	public static padding: number = 50;
	public static height: number = 150;
	public static width: number = 7;

	constructor (canvas: HTMLCanvasElement, private paddleType: PaddleType, private selectedMap: string)
	{
		super (
			canvas,
			Paddle.padding,
			canvas.height / 2 - Paddle.height / 2,
			200,
			''
			)
			if (this.selectedMap === 'Classic')
			{
				this.setFillStyle('#00adf7');
				Paddle.padding = 50;
				Paddle.height = 150;
				Paddle.width = 7;
			}
			if (this.selectedMap === 'Spaceship')
			{
				this.setFillStyle('#777777');
				Paddle.padding = 50;
				Paddle.height = 150;
				Paddle.width = 12;
			}
			if (this.selectedMap === 'Galaxy')
			{
				this.setFillStyle('#FF66C4');
				Paddle.padding = 50;
				Paddle.height = 150;
				Paddle.width = 10;
			}
			if (this.paddleType != PaddleType.Start) {
				this.setX(canvas.width - Paddle.padding);
				if (this.selectedMap === 'Spaceship')
				  this.setFillStyle('#777777');
				if (this.selectedMap === 'Classic') 
					this.setFillStyle('#f700ad');
				if (this.selectedMap === 'Galaxy') 
					this.setFillStyle('#FF66C4');
			}
	}
	
	render (): void {
		const ctx = this.canvas.getContext ("2d");
		if (!ctx)
			return console.error ("failed to get context");

		ctx.fillStyle = this.fillStyle;
		ctx.shadowColor = this.fillStyle;
		ctx.shadowBlur = 40
		ctx?.fillRect (this.x, this.y, Paddle.width, Paddle.height);
	}

	type(): Type {
		return Type.Paddle;
	}

	deflect(dir: Vector, paddleLeft: Paddle|null, paddleRight: Paddle|null): Vector {
		if (paddleLeft || paddleRight)
			console.error ("invalid paddle values")
		return dir;
	};

	hasScored (): boolean { return false; }

	willCollide (dir: Vector, paddleLeft: Paddle|null, paddleRight: Paddle|null): boolean
	{
		if (paddleLeft || paddleRight)
		{
			console.log ("paddleLeft || paddleRight not null")
			return false;
		}
		
		if (dir.y < 0 && this.y <= 0)
		{
			this.y = 0;
			return true;
		}
		else if (dir.y > 0 && this.y + Paddle.height >= this.canvas.height)
		{
			this.y = this.canvas.height - Paddle.height;
			return true;
		}
		return false;
	}
}