/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   app.module.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mac <mac@student.42.fr>                    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/05/03 14:59:11 by katchogl          #+#    #+#             */
/*   Updated: 2023/11/22 22:14:38 by mac              ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common"
import { UsersModule } from "./api/users/users.module"
import { ChatModule } from "./api/chat/chat.module"
import { Channel } from "./api/channels/channel.entity";
import { ChannelsRepository } from "./api/channels/channels.repository";
import { UsersRepository } from "./api/users/users.repository";
import { User } from "./api/users/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm"
import { ChannelsModule } from "./api/channels/channels.module";
import { MessagesModule } from "./api/messages/messages.module";
import { Message } from "./api/messages/message.entity";
import { MessagesRepository } from "./api/messages/messages.repository";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from './api/auth/auth.module';
import { MiddlewareModule } from "./api/auth/utils/cors.module";
import { GameModule } from "./api/game/game.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '../docker/.env',
			isGlobal: true
		}),
		UsersModule,
		TypeOrmModule.forRoot({
			type: 'postgres',
			// host: 'localhost',
			host: 'db',
			port: 5432,
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			entities: [
				User,
				Channel,
				Message
			],
			synchronize: true
		}),
		ChannelsModule,
		MessagesModule,
		TypeOrmModule.forFeature([
			User,
			Channel,
			Message,
			UsersRepository,
			ChannelsRepository,
			MessagesRepository
		]),
		ChatModule,
		AuthModule,
		MiddlewareModule,
		GameModule
	],
})
export class AppModule
{
}
