import { Module } from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import { ChannelsRepository } from "./channels.repository";
import { ChannelsController } from "./channels.controller";

@Module ({
	imports: [],
	controllers: [ChannelsController],
	providers: [ChannelsRepository, ChannelsService ]
})
export class ChannelsModule {

	
}