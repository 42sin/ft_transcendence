import { Controller, Get, Param, Post } from "@nestjs/common"
import { Message } from "./message.entity"
import { MessagesService } from "./messages.service"


@Controller ("messages")
export class MessagesController {

	constructor (private readonly messagesService: MessagesService) {}

	async createMessage(message: Message): Promise<Message> {
		return await this.messagesService.createMessage (message)
	}

	@Get ("interlocutor/:username/:interlocutorUsername/")
	async getMessagesWithInterlocutor (@Param("username") username: string,
		@Param("interlocutorUsername") interlocutorUsername: string): Promise<Message[]>
	{
		return await this.messagesService.getMessagesWithInterlocutor (username, interlocutorUsername)
	}

	@Get ("channel/:channelName/")
	async getMessageWithChannel (@Param("channelName") channelName: string): Promise<Message[]>
	{
		return await this.messagesService.getMessagesWithChannel (channelName)
	}
}
