/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: sreinhol <sreinhol@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/05/03 14:59:05 by katchogl          #+#    #+#             */
/*   Updated: 2023/10/22 10:57:13 by sreinhol         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable } from "@nestjs/common"
import { UsersRepository } from "./users.repository";
import { User } from "./user.entity";
import { InsertResult, UpdateResult } from "typeorm" 
import * as fs from 'fs'

@Injectable ()
export class UsersService
{
	constructor (private readonly usersRepository: UsersRepository) {}

	async saveUser(user: User): Promise<User>{
		return await this.usersRepository.saveUser(user);
	}
	async upsertUser(users: User[]): Promise<InsertResult> {
		return await this.usersRepository.upsertUser (users)
	}
	
	async getUserByID(userID: number): Promise<User> {
		return await this.usersRepository.getUserByID (userID);
	}
	async getUserByEmail(email: string): Promise<User>{
		return await this.usersRepository.getUserByEmail(email);
	}	
	async getUser(username: string): Promise<User> {
		return await this.usersRepository.getUser (username);
	}
	
	async getUsers(): Promise<User[]> {
		return await this.usersRepository.getUsers ();
	}
	async updateUsers(whereConditions: Object, updates: Object): Promise<UpdateResult> {
		return await this.usersRepository.update (whereConditions, updates)
	}
	//tmp
	async deleteUser(username: string){
		return await this.usersRepository.deleteUser(username);
	}
	deleteAvatar(avatar: string)	{
		const filePath = `./uploads/${avatar}`
		try {
			fs.unlinkSync(filePath);
			console.log(`${avatar} deleted with success`)
		} catch (error)	{
			console.log(`failed to delete ${avatar}`, error)
		}
	}
	async blockUser(yourId: number, friendId: number)	{
	// async blockUser(u: User, friend: User)	{
		const u = await this.getUserByID(yourId);
		const friend = await this.getUserByID(friendId);
		
		let idx = u.pending.indexOf(friend.userID);
		if (idx !== -1)	{
			u.pending.splice(idx, 1);
		}
		idx = u.friends.indexOf(friend.userID);
		if (idx !== -1)	{
			u.friends.splice(idx, 1);
		}
		idx = friend.friends.indexOf(u.userID);
		if (idx !== -1)	{
			friend.friends.splice(idx, 1);
		}
		idx = friend.pending.indexOf(u.userID);
		if (idx !== -1)	{
			friend.pending.splice(idx, 1);
		}
		u.blocked.push(friend.userID);
		await this.saveUser(u);
		await this.saveUser(friend);
	}
	async unBlockUser(yourId: number, friendId: number)	{
		const u = await this.getUserByID(yourId);
		let idx = u.blocked.indexOf(friendId);
		if (idx !== -1)	{
			u.blocked.splice(idx, 1);
		}
		await this.saveUser(u);
	}
}
