import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {

	constructor (private readonly messagesRepository: MessagesRepository) {}

	async createMessage(message: Message): Promise<Message> {
		return await this.messagesRepository.createMessage (message)
	}

	async getMessagesWithInterlocutor(username: string, interlocutorUsername: string): Promise<Message[]>
	{
		return await this.messagesRepository.getMessagesWithInterlocutor (username, interlocutorUsername)
	}

	async getMessagesWithChannel(channelName: string): Promise<Message[]>
	{
		return await this.messagesRepository.getMessagesWithChannel (channelName)
	}
	async deleteChannelMessages(channelName: string){
		return await this.messagesRepository.deleteChannelMessages(channelName);
	}
}
