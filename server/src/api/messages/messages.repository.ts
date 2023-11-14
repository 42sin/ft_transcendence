import { Injectable } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { Message } from "./message.entity";
import { UsersRepository } from "../users/users.repository";
import { User } from "../users/user.entity";
import { Logger } from "src/static/Logger";
import { ChannelsRepository } from "../channels/channels.repository";
import { Channel } from "../channels/channel.entity";

@Injectable ()
export class MessagesRepository extends Repository<Message> {

	constructor (readonly manager: EntityManager
		, private readonly usersRepository: UsersRepository
		, private readonly channelsRepository: ChannelsRepository) {
		super (Message, manager)
	}
	
	async createMessage(message: Message): Promise<Message> {
		return await this.save (message)
	}

	async getMessagesWithInterlocutor(username: string, interlocutorUsername: string): Promise<Message[]>
	{
		const user: User = await this.usersRepository.getUser (username)
		const interlocutor: User = await this.usersRepository.getUser (interlocutorUsername)

		if (!user || !interlocutor)
		{
			Logger.error ("failed to get user(s)")
			return [];
		}

		return await this.createQueryBuilder ("message")
			.where ("(message.senderID = :userID AND message.recipientID = :interlocutorID) OR (message.senderID = :interlocutorID AND message.recipientID = :userID)")
			.setParameter ("userID", user.userID)
			.setParameter ("interlocutorID", interlocutor.userID)
			.getMany ();
	}

	async getMessagesWithChannel(channelName: string): Promise<Message[]> {

		const channel: Channel = await this.channelsRepository.getChannel (channelName);

		if (!channel)
		{
			Logger.error ("failed to get channel @messages: " + channelName)
			return []
		}

		return await this.createQueryBuilder ("message")
			.where ("message.recipientID = :channelID")
			.setParameter ("channelID", "#" + channel.channelID)
			.getMany ()
	}
	async deleteChannelMessages(channelName: string)	{
		const channel: Channel = await this.channelsRepository.getChannel(channelName);
		if (!channel)	{
			console.log("no such channel")
			return
		}
		return await this.createQueryBuilder("message")
			.delete()
			.where("recipientID = :channelID")
			.setParameter("channelID", '#' + channel.channelID)
			.execute()
	}
}
