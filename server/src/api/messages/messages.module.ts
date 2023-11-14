import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './messages.repository';
import { MessagesController } from './messages.controller';
import { UsersModule } from '../users/users.module';
import { ChannelsModule } from '../channels/channels.module';
import { UsersRepository } from '../users/users.repository';
import { ChannelsRepository } from '../channels/channels.repository';

@Module({
	imports: [UsersModule, ChannelsModule],
controllers: [MessagesController],
  providers: [MessagesRepository, MessagesService, UsersRepository, ChannelsRepository]
})
export class MessagesModule {}
