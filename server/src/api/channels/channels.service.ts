import { Injectable } from "@nestjs/common";
import { ChannelsRepository } from "./channels.repository";
import { Channel } from "./channel.entity";
import { UpdateResult } from "typeorm";
import { Logger } from "src/static/Logger";

@Injectable ()
export class ChannelsService {

	constructor (private channelsRepository: ChannelsRepository) {

	}

	async getChannel(channelName: string): Promise<Channel> {
		return await this.channelsRepository.getChannel (channelName)
	}
	
	async getChannelByID(channelID: number): Promise<Channel> {
		return await this.channelsRepository.getChannelByID (channelID)
	}

	async saveChannel(channel: Channel): Promise<Channel> {
		return await this.channelsRepository.saveChannel (channel)
	}

	async updateChannels(whereConditions: Object, updates: Object): Promise<UpdateResult> {
		return await this.channelsRepository.updateChannels (whereConditions, updates)
	}

	async getChannels(): Promise<Channel[]> {
		return await this.channelsRepository.getChannels ();
	} 

	async deleteChannel(channelId: number)	{
		return await this.channelsRepository.deleteChannel(channelId);
	}

}