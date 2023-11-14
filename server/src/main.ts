/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ajazbuti <ajazbuti@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/05/03 14:59:35 by katchogl          #+#    #+#             */
/*   Updated: 2023/07/10 13:33:49by ajazbuti         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { NestFactory } from '@nestjs/core';
import * as express from "express";
import { join } from "path"
import { AppModule } from './app.module';
import { Logger } from './static/Logger';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';
//for refresh??
import * as history from 'connect-history-api-fallback';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const history = require('connect-history-api-fallback')	
	config();
	const port = process.env.PORT;
	let staticFiles = join (__dirname, "..", "..", "..", "client", "dist", "client");
	
	const app = await NestFactory.create (AppModule);
	app.use(cookieParser());
	app.use(history({
		rewrites: [
			{
				from: 
					/^\/auth\/.*$/,
				to: function(context)	{
					return context.parsedUrl.path
				}
			},
			{
				from: 
					/^\/users\/.*$/,
				to: function(context)	{
					return context.parsedUrl.path
				}
		}
		]
	}))
	.use(express.static(staticFiles));
	// app.enableCors({
		// origin: '127.0.0.1:3000',
		// credentials: true
	// });
	//TODO new validationPipe()
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true
	}));
	await app.listen(port, () =>
	{
		Logger.success (`NestJS application start success. Address: ${process.env.IP} Listening on port: ` + port + ".")
	});
}

bootstrap ();
