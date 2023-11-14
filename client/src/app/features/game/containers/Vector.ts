/**
 * Class representing a vector in the plane and used to move Objects in specified direction.
 * Pixel plane:
 *		-1
 *	-1		1
 *		1
 */
export class Vector {
	/**
	 * 
	 * @param x Vector's x coordinate.
	 * @param y Vector's y coordinate.
	 */
	constructor (public x: number, public y: number) {}
}
