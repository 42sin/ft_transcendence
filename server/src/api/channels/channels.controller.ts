import { Controller, Get, Param } from "@nestjs/common";
import { ChannelsService } from "./channels.service";

@Controller("channels")
export class ChannelsController
{
	constructor(private readonly channelsService: ChannelsService) {}

	@Get ()
	getChannels ()
	{
		return this.channelsService.getChannels ();
	}

	@Get (":channelID")
	getChannel (@Param("channelID") channelID: number)
	{
		return this.channelsService.getChannelByID (channelID)
	}
}