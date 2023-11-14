import { Dir } from "@angular/cdk/bidi";
import { Vector } from "../containers/Vector";
import { Paddle } from "./Paddle";
import { Ball } from "./Ball";
import { GameComponent } from "../game.component";

/**
 * @description An enum holding possible map objects.
 */
export enum Type { Paddle, Ball }

/**
 * @description An abstract class representing a movable geometric shape on the map with shared obtainable properties and methods.
 */
export abstract class AObject {

	/**
	 * 
	 * @param x The x coordinate of the object.
	 * @param y The y coordinate of the object.
	 * @param dist The distance the object travels in one single click. In another words, the dist to multiply by a vector coordinate.
	 * @param fillStyle The fill color of the object.
	 */
	constructor (
		protected canvas: HTMLCanvasElement,
		protected x: number,
		protected y: number,
		protected dist: number,
		protected fillStyle: string
	) {}

	private frames = 100; // make anim faster or slower (cause loss of animation if decremented exaggeratedly)

	private dir: Vector | null = null;

	/** abstract methods */
	abstract render (): void;
	abstract type (): Type;
	abstract deflect (dir: Vector, paddleLeft: Paddle|null, paddleRight: Paddle|null): Vector;
	/** @description check whether object has hit the wall in dir Direction */
	abstract willCollide (dir: Vector, paddleLeft: Paddle|null, paddleRight: Paddle|null): boolean;
	abstract hasScored (): boolean;

	async move (dir: Vector): Promise<void> { await this.mMove (dir, null, null) }

	async mMove (dir: Vector, paddleLeft: Paddle|null, paddleRight: Paddle|null): Promise<Vector>
	{
		/** check if valid dir based on Object type  */
		if (this.type () == Type.Paddle && dir.x != 0)
		{
			console.log ("object cannot move in direction")
			return dir;
		}
		
		let i = -1;
		const STEP = this.dist / this.frames;
		const INTERPOLATION = 0.50 // make anim faster or slower in a safe manner so as to not lose effect

		/** register direction */
		this.dir = dir;

		let timeout = 0;

		while (++i < this.frames)
		{
			/** if different direction, start countdown to cancel movement */
			if (dir != this.dir && timeout < 5)
				timeout++;
			else if (dir != this.dir)
				break ;

			if (this.type () == Type.Ball && this.hasScored ())
				return new Vector (0, 0);

			else if (this.type () == Type.Ball && this.willCollide (dir, paddleLeft, paddleRight))
				dir = this.deflect (dir, paddleLeft, paddleRight)
			
			else if (this.type () == Type.Paddle && this.willCollide (dir, null, null))
				break ;

			this.x += dir.x * STEP;
			this.y += dir.y * STEP;

			// TODO: upgrade logic and remove this
			if (this.type () != Type.Ball)
			{
				await GameComponent.delay (INTERPOLATION)
			}
		}

		return dir;
	}

	/** setters */
	setX (nX: number): void { this.x = nX;  }
	setY (nY: number): void {  this.y = nY; }
	setdist (ndist: number): void { this.dist = ndist; }
	setFillStyle (nFillStyle: string): void { this.fillStyle = nFillStyle; }

	/** getters */
	getX (): number { return this.x; }
	getY (): number { return this.y; }
	getdist (): number { return this.dist; }
	getFillStyle (): string { return this.fillStyle; }
}
