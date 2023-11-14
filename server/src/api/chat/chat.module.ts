import { Module } from '@nestjs/common'
import { ChatGateway } from './chat.gateway';
import { ChannelsModule } from '../channels/channels.module';
import { ChannelsRepository } from '../channels/channels.repository';
import { ChannelsService } from '../channels/channels.service';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { MessagesService } from '../messages/messages.service';
import { MessagesRepository } from '../messages/messages.repository';

@Module ({
	imports: [ UsersModule, ChannelsModule, MessagesModule ],
	controllers: [],
	providers: [ UsersRepository, UsersService, 
		ChannelsRepository, ChannelsService, ChatGateway,
		MessagesService, MessagesRepository ]
})
export class ChatModule {

}
