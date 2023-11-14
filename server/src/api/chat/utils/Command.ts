import { User } from "../../users/user.entity"

export class Command {

	constructor (private user: User, private realName: string, private name: string, private args: string[], private recipient: string) {

		/** logs */
		// console.log ("\ncommand.caller.username: " + caller.getUsername ())
		console.log ("command.realName: " + realName)
		console.log ("command.name: " + this.name)
		console.log ("command.args:")
		console.log (args)
		console.log ("recipient: " + recipient);
	}

	/** Getters */
	getUser (): User { return this.user }
	getRealName (): string { return this.realName }
	getName (): string { return this.name }
	getArgs(): string[] { return this.args }
	getRecipient(): string { return this.recipient }
}