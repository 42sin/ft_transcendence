import { Injectable } from "@nestjs/common";
import { EntityManager, Repository, UpdateResult } from "typeorm";
import { Channel } from "./channel.entity";
import { Logger } from "src/static/Logger";

@Injectable ()
export class ChannelsRepository extends Repository<Channel> {

	constructor (readonly manager: EntityManager) {
		super (Channel, manager)
	}

	async saveChannel(channel: Channel): Promise<Channel> {
		return await this.save (channel)
	}

	async getChannel(channelName: string): Promise<Channel> {

		if (channelName[0] != '#')
			channelName = "#" + channelName;
		
		return await this.findOneBy ({ name: channelName})
	}

	async getChannelByID(channelID: number): Promise<Channel> {
		return await this.findOneBy ({ channelID: channelID })
	}

	async getChannels(): Promise<Channel[]> {
		return await this.find ();
	}

	async updateChannels(whereConditions: Object, updates: Object): Promise<UpdateResult> {
		return await this.update (whereConditions, updates);
	}
	async deleteChannel(channelId: number){
		return await this.delete({channelID: channelId})
	}
}