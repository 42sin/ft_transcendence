import { Channel } from "../../../../../../server/src/api/channels/channel.entity";
import { User } from "../../../../../../server/src/api/users/user.entity";
import { Element } from "./element"

/**
 * Class representing a chat on the UI.
 * @property recipient: user username|channel name;
 * @property profilePictureName: the name of the file on the server;
 * @property lastMessage: the last message sent between the user and the recipient;
 * @property time: time sent of lastMessage.
 */
export class ChatElement extends Element {

	constructor (private entity: User|Channel) { super (); }

	getRecipientName (): string {
		
		if (this.entity && (this.entity as User).username)
			return (this.entity as User).username
		else if (this.entity && (this.entity as Channel).name)
			return (this.entity as Channel).name
		else
			return ""
	}
	getAdmins(): string | null	{
		if (this.entity && (this.entity as Channel).admins)	{
			return (this.entity as Channel).admins
		}	else	{
			return null;
		}
	}
	getMembers(): string | null	{
		if (this.entity && (this.entity as Channel).members)	{
			return (this.entity as Channel).members
		}	else	{
			return null; 
		}
	}
	getChatId(): number | null	{
		
		if (this.entity && (this.entity as Channel).channelID)
			return (this.entity as Channel).channelID
		else return null
	}

	getLastMessage (): string {
		return ""
	}

	getTime (): string {
		return ""
	}

	getProfilePictureName (): string {
		return "";
	}

	isEqual(otherChat: ChatElement): boolean {
		return this.getRecipientName() === otherChat.getRecipientName()
	}
}
