import { Message } from "../../../../../../server/src/api/messages/message.entity";
import { Element } from "./element"

export class MessageElement extends Element {
	
	constructor (private message: Message) { super () }

	getMessage (): Message { return this.message; }
}
