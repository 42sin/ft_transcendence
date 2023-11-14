import { Socket } from "socket.io";
import { Logger } from "../../../static/Logger";

export enum EvResponseStatus {

	SUCCESS = 0,

	NO_INVITE = 3,
	INVITE_PENDING = 4,
	INVITE_ACCEPTED = 5,
	INVITE_DECLINED = 6,
	INVITE_SENT_PENDING = 7,

	FAILURE = 100,
	INTERNAL_SERVER_ERROR = 101,

	
	NO_SUCH_CMD = 110,

	INVALID_ARGS_COUNT = 120,


	INCOMPLETE_REQUEST = 130,

	
	USER_ALREADY_ON_CHANN = 140,
	INVALID_CHANNNAME = 141,
	PROTECTED_CHANN_ACCESS_DENIED = 142,
	PRIVATE_CHANN_ACCESS_DENIED = 143,
	CHANN_INVALID_KEY = 144,
	NO_SUCH_CHANNEL = 145,
	NO_CHANNEL_GIVEN = 146,
	USER_IS_BANNED = 147,

	NO_SUCH_USER = 150,
	USER_ALREADY_ADDED = 151,
	NO_USER_GIVEN = 152,
	USER_IS_YOURSELF = 153,
	USER_IS_NOT_IN_CHAT = 154,
	USER_IS_NOT_ADMIN = 155,
	USER_IS_NOT_OWNER = 156,
	USER_HAS_BLOCKED_YOU = 157,
	USER_IS_BLOCKED = 158,
	USER_IS_MUTED = 159,

	USER_NOT_AVAILABLE = 160,
	USER_DID_NOT_ACCEPT = 161,

	USER_TO_ADD_IS_NOT_IN_CHAT = 170,
	USER_TO_KICK_IS_NOT_IN_CHAT = 171,
	USER_TO_KICK_IS_OWNER = 172,
	USER_TO_MUTE_IS_NOT_IN_CHAT = 173,
	USER_TO_MUTE_IS_OWNER = 174,
	INVALID_MINUTES_TO_MUTE = 175,
	USER_IS_ALREADY_MUTED = 176,
	USER_TO_BAN_IS_NOT_IN_CHAT = 177,
	USER_TO_BAN_IS_OWNER = 178,

	NO_PASSWORD_SET = 179,
	OWNER_TRIES_TO_LEAVE = 180,
	USER_ALREADY_BLOCKED = 181,
	NOT_INVITED = 182
}

export class EventResponse {

	public status: EvResponseStatus = EvResponseStatus.FAILURE;
	public success: boolean = false;
	/** Any sort of additional information about the response status. */
	public data: any;

	constructor (public readonly eventName: string, private readonly socket: Socket) {
	}

	beEmitted (): void {

		if (!this.socket)
		{
			Logger.error("cannot emit socket event when socket is undefined");
		}

		/** aut-set success property based on status range  */
		if (this.status >= EvResponseStatus.SUCCESS 
			&& this.status < EvResponseStatus.FAILURE)
			this.success = true;

		/** JSON response based on this' data */
		const result = {
			"eventName": this.eventName,
			"status": this.status,
			"success": this.success,
			"data": this.data
		}

		/** DEBUG */
		Logger.log ("\n> response: ");
		if (this.success)
			Logger.success ("success")
		else 
			Logger.error ("failure")

		/** DEBUG */
		console.log ("RESULT:",result, "JSON:", JSON.stringify (result))
		this.socket.emit (this.eventName, JSON.stringify (result))

		this.reset ()
	}

	private reset () {

		this.success = false;
		this.status = EvResponseStatus.FAILURE
		this.data = undefined
	}
}