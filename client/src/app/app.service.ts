import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {

	readonly mTitle = "42pong"; 

	constructor() { }

	getMTitle(): string{
		return this.mTitle;
	}
}
