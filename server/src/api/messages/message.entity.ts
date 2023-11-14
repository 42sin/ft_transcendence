import { Collection, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Channel } from "../channels/channel.entity";
import { send } from "process";

@Entity ()
export class Message {

	@PrimaryGeneratedColumn ()
	messageID: number = 0

	@Column ()
	senderID: number = 0

	@Column ({nullable: true})
	senderName: string = ""

	@Column ()
	recipientID: string = ""

	@Column ()
	text: string = ""

	@Column ()
	time: string = ""

	constructor (senderID: number, senderName: string, recipientID: string, text: string, time: string)
	{
		this.senderID = senderID
		this.senderName = senderName
		this.recipientID = recipientID
		this.text = text
		this.time = time
	}
}
