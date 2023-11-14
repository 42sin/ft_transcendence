/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.repository.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ajazbuti <ajazbuti@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/05/03 14:59:14 by katchogl          #+#    #+#             */
/*   Updated: 2023/06/20 14:41:04 by ajazbuti         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable } from "@nestjs/common";
import { User } from "./user.entity";
import { EntityManager, InsertResult, Repository, UpdateResult } from "typeorm";
import { Logger } from "src/static/Logger";
 
@Injectable ()
export class UsersRepository extends Repository<User>
{
	constructor (readonly manager: EntityManager) {
		super (User, manager)
	}

	async saveUser(user: User): Promise<User>{
		return await this.save(user);
	}
	async upsertUser(users: User[]): Promise<InsertResult> {
		return await this.upsert (users, ["userID"])
	}

	async getUserByID(userID: number): Promise<User> {
		return await this.findOneBy ({ userID: userID  });
	}
	
	async getUserByEmail(email: string): Promise<User>	{
		return await this.findOneBy({email: email})
	}

	async getUser (username: string): Promise<User> {
		return await this.findOneBy ({ username: username })
	}

	async getUsers(): Promise<User[]> {
		return await this.find ();
	}

	async updateUsers(whereConditions: Object, updates: Object): Promise<UpdateResult> {
		return await this.update (whereConditions, updates);
	}
	//tmp
	async deleteUser(username: string){
		return await this.delete({username: username})
	}
}