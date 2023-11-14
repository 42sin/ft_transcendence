import { Controller, Get, Post, Req, Res, Delete, Param, UseGuards, UploadedFile, UseInterceptors, BadRequestException, UnauthorizedException, Body, HttpException, InternalServerErrorException, HttpStatus } from '@nestjs/common'
import { UsersService } from "./users.service"
import { AuthGuard } from '@nestjs/passport';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'
import { CurrentUserGuard } from '../auth/guards';
import { User } from './user.entity';
import { CurrentUser } from '../auth/decorators';
import { Response } from 'express';
@Controller('users')
export class UsersController
{
	constructor(private readonly usersService: UsersService ) {}
	@Get()
	// @UseGuards(AuthGuard('jwt'))
	@UseGuards(AuthGuard('tfa'))
	async getUsers ()	{
		const users: User[] = await this.usersService.getUsers();
		return users.map(user => {
			delete user.tfaSecret;
			return user;
		});
	}
	@Get('id/:userID')
	// @UseGuards(AuthGuard('jwt'))
	@UseGuards(AuthGuard('tfa'))
	async getUser(@Param("userID") userID: number)
	{
		const user: User = await this.usersService.getUserByID (userID);
		delete user.tfaSecret;
		return user;
	}
	@Get('user/:username')
	// @UseGuards(AuthGuard('jwt'))
	@UseGuards(AuthGuard('tfa'))
	async getUserByName(@Param('username') username: string){
		const user: User = await this.usersService.getUser(username);
		delete user.tfaSecret;
		return 	user
	}
	@Get('me')
	// @UseGuards(AuthGuard('jwt'))
	@UseGuards(AuthGuard('tfa'))
	@UseGuards(CurrentUserGuard)
	async getMe(@CurrentUser() user: User){
		console.log(user)
		if (user)	{
			const u = await this.usersService.getUserByEmail(user.email);
			delete u.tfaSecret;
			return u;
		}
		throw new UnauthorizedException();
	}
	@Post('upload-avatar')
	// @UseGuards(AuthGuard('jwt'))
	@UseGuards(AuthGuard('tfa'))
	@UseGuards(CurrentUserGuard)
	@UseInterceptors(FileInterceptor('file', {
		storage: diskStorage({
			destination: './uploads',
			filename: (req, file, cb) => {
				const suffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
				const ext = file.originalname.split('.').pop();
				const newName = `${file.originalname.split('.').slice(0, -1).join('_').replace(/ /g, '_')}_${suffix}.${ext}`;
				cb(null, newName);
			}
		}),
		fileFilter: (req, file, cb) => {
			if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
				// return cb(new Error('Only JPG, JPEG, PNG, and GIF files are allowed.'), false);
				return cb(null, false);
			}
			cb(null, true);
		},
		limits: {
			fileSize: 500000
		}
	}))
	async uploadAvatar(@UploadedFile() file: Express.Multer.File,
					@CurrentUser() user: User){
		console.log(file);
		if (!file){
			throw new BadRequestException("Bad format or too large file");
		}	else{
			if (user.avatar){
				this.usersService.deleteAvatar(user.avatar)
			}
			await this.usersService.updateUsers({
				email: user.email
			},	{
				avatar: `${file.filename}`
			})
			return {success: true}
		}
	}
	@Get('avatar/:filename?')
	async getAvatar(@Param('filename') filename: string, @Res() res: Response){
		console.log(filename);
		res.setHeader('Contet-Type', 'image/jpeg');
		try {
			const fs = require('fs');
			if (filename)	{
				const filePath = './uploads/' + filename;
				fs.access(filePath, fs.constants.F_OK, (err) => {
					if (err) {
						return res.status(404).send('File not found');
					}
					res.sendFile(filename, {
						root: './uploads'
					});
				});
			}
			else {
				res.sendFile('default.jpeg', {
				root: './avatars'
				})
			};
		}
		catch (error) {
			console.log(error);
			throw new BadRequestException('Avatar not found');
		}
	}
	
	@Post('change-username')
	@UseGuards(AuthGuard('tfa'))

	// @UseGuards(AuthGuard('jwt'))
	@UseGuards(CurrentUserGuard)
	async changeUsername(@CurrentUser() user: User,
		/*@Req() req: Request, @Res() res: Response,*/ @Body('username') newUsername: string)	{
		// 1 letter min 3 max 10 lenght
		const usernameRegex = /^[a-zA-Z0-9]{3,10}$/;
		if (usernameRegex.test(newUsername)){
			try{
				await this.usersService.updateUsers(
					{email: user.email},
					{username: newUsername}
				)
				return {success: true}
			} catch (error)	{
				console.log(error);
				throw new BadRequestException('Username already in use')
			}

		}	else	{
			throw new BadRequestException('Bad username format');
		}
	}

	@Post('increment-wins')
	@UseGuards(AuthGuard('tfa'))
	@UseGuards(CurrentUserGuard)
	async incrementWins(@CurrentUser() user: User, @Body() data: {winner: string, opponent: string, score: string}) {
		if (data.winner == user.username)
		{
			try {
				user.wins += 1;
				user.gamesPlayed += 1;
				user.scores.push(data.score);
				user.gameWins.push(true);
				user.opponents.push(data.opponent);
				await this.usersService.saveUser(user);
				return { success: true };
			} catch (error) {
			  console.log(error);
			  throw new BadRequestException('Failed to increment wins');
			}
		}
		else
		{
			try {
				user.loses += 1;
				user.gamesPlayed += 1;
				user.scores.push(data.score);
				user.gameWins.push(false);
				user.opponents.push(data.opponent);
				await this.usersService.saveUser(user);
				return { success: true };
			} catch (error) {
			  console.log(error);
			  throw new BadRequestException('Failed to increment losses');
		}
	  }
	}
  
	@Post('increment-losses')
	@UseGuards(AuthGuard('tfa'))
	@UseGuards(CurrentUserGuard)
	async incrementLosses(@CurrentUser() user: User) {
	  try {
			user.loses += 1;
			await this.usersService.saveUser(user);
			return { success: true };
	  } catch (error) {
		console.log(error);
		throw new BadRequestException('Failed to increment losses');
	  }
	}



	@Post('add-friend/:id')
	// @UseGuards(AuthGuard('jwt'))
	@UseGuards(AuthGuard('tfa'))
	@UseGuards(CurrentUserGuard)
	async addFriend(@CurrentUser() user: User, @Param('id') id: number){
		if (id == user.userID)	{
			throw new BadRequestException("cant invite self")
		}
		const u = await this.usersService.getUserByID(user.userID)
		const friend = await this.usersService.getUserByID(id);
		if (u.blocked.includes(friend.userID))	{
			throw new BadRequestException('User is blocked by you')
		}
		if (friend.blocked.includes(u.userID))	{
			throw new BadRequestException('User has blocked you')
		}
		if (u.friends.includes(friend.userID))	{
			throw new BadRequestException("already friends") 
		}
		if (friend.pending.includes(u.userID)){
			throw new BadRequestException("alreadey invited") 
		}
		friend.pending.push(u.userID);
		try	{
			await this.usersService.saveUser(friend);
			return {success: true}
		} catch (error)	{
			console.log(error);
			throw new InternalServerErrorException(error);
		}	
	}
	@Post('accept-friend/:id')
	// @UseGuards(AuthGuard('jwt'))
	@UseGuards(AuthGuard('tfa'))
	@UseGuards(CurrentUserGuard)
	async acceptFriend(@CurrentUser() user: User, @Param('id') id: number){
		const u = await this.usersService.getUserByID(user.userID);
		const friend = await this.usersService.getUserByID(id);
		let idx = u.pending.indexOf(friend.userID);
		if (idx !== -1)	{
			u.pending.splice(idx, 1);
		}
		idx = friend.pending.indexOf(u.userID);
		if (idx !== -1)	{
			u.pending.splice(idx, 1);
		}
		// if (!u.friends.includes(friend.userID) && !friend.friends.includes(u.userID)){
		u.friends.push(friend.userID);
		friend.friends.push(u.userID);
		try {
			await this.usersService.saveUser(u);
			await this.usersService.saveUser(friend);
			return {success: true};
		} catch (error){
			console.log(error);
			throw new InternalServerErrorException(error);
		}
	}
	@Post('/block/:id')
	// @UseGuards(AuthGuard('jwt'))
	@UseGuards(AuthGuard('tfa'))
	@UseGuards(CurrentUserGuard)
	async blockUser(@CurrentUser() user: User, @Param('id') id: number){
		
		const u = await this.usersService.getUserByID(user.userID);
		const friend = await this.usersService.getUserByID(id);
		if (!friend)	{
			throw new BadRequestException('no such user');
		}
		if (u.userID == id)	{
			throw new BadRequestException("Can't block self")
		}
		if (u.blocked.includes(friend.userID))	{
			throw new BadRequestException('already blocked')
		}
		try	{
			await this.usersService.blockUser(u.userID, friend.userID)
			// await this.usersService.blockUser(u, friend)
			return {success: true}
		}	catch (error)	{
			console.log(error);
			throw new InternalServerErrorException(error)
		}
	}
	@Post('/remove-friend/:id')
	// @UseGuards(AuthGuard('jwt'))
	@UseGuards(AuthGuard('tfa'))
	@UseGuards(CurrentUserGuard)
	async removeFriend(@CurrentUser() user: User, @Param('id') id: number){
		const u = await this.usersService.getUserByID(user.userID);
		const friend = await this.usersService.getUserByID(id);
		if (!friend)	{
			throw new BadRequestException('no such user');
		}
		if (u.userID == id)	{
			throw new BadRequestException("Can't unfriend self")
		}
		if (!u.friends.includes(friend.userID))	{
			throw new BadRequestException('User is not your friend')
		}
		let idx = u.friends.indexOf(friend.userID);
		if (idx !== -1)	{
			u.friends.splice(idx, 1);
		}
		idx = friend.friends.indexOf(u.userID);
		if (idx !== -1)	{
			friend.friends.splice(idx, 1);
		}
		try	{
			await this.usersService.saveUser(u);
			await this.usersService.saveUser(friend);
			return {success: true}
		}	catch (error)	{
			console.log(error);
			throw new InternalServerErrorException(error)
		}
	}
	@Post('/unblock/:id')
	// @UseGuards(AuthGuard('jwt'))
	@UseGuards(AuthGuard('tfa'))
	@UseGuards(CurrentUserGuard)
	async unblockUser(@CurrentUser() user: User, @Param('id') id: number){
		const u = await this.usersService.getUserByID(user.userID);
		const friend = await this.usersService.getUserByID(id);
		if (!friend)	{
			throw new BadRequestException('no such user');
		}
		if (u.userID == id)	{
			throw new BadRequestException("Can't unblock self")
		}
		if (!u.blocked.includes(friend.userID))	{
			throw new BadRequestException('user is not blocked')
		}
		try	{
			// await this.usersService.unBlockUser(u, friend.userID);
			await this.usersService.unBlockUser(u.userID, friend.userID);
			return { success: true }
		}	catch (error)	{
			console.log(error);
			throw new InternalServerErrorException(error)
		}
	}
	// @Delete(':id')
	// deleteUser(id: number)
	// {
	// 	return this.usersService.deleteUser (id);
	// }
}
