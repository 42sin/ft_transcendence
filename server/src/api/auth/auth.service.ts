import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtPayload, UserDetails } from './utils';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService,
                private readonly jwtService: JwtService,
                private readonly configService: ConfigService){}


    async validateUser(details: UserDetails){
        //TODO remove this
        // console.log(await this.userService.deleteUser('ajazbuti'))
        // console.log(process.env.JWT_SECRET_ACCESS)

        // await this.userService.updateUsers(
        //     {username: "hntest2"},
        //     {wins: 12, loses: 5})
        // await this.userService.updateUsers(
        //     {username: 'hntest1'},
        //     {wins: 2})

        console.log(details);
        const user = await this.userService.getUserByEmail(details.email);
        console.log("USER", user)
        if (user){
            console.log("validateUser -- exists: ", user)
            return user;
        }
        console.log("validateUser -- does'.t exist: ", user)
        const entry = new User(details.username);
        entry.email = details.email;
        entry.friends = [];
        entry.pending = [];
        entry.blocked = [];
        console.log("entry: ", entry)
        try {
            const newUser = await this.userService.saveUser(entry)
            console.log("New User: ", newUser)
            return newUser;
        } catch (error) {
            throw new InternalServerErrorException("failed creating entry in database");
        }
    }
    async signToken(payload: JwtPayload): Promise<{expiresIn: string, access_token: string}>{
        const secret = this.configService.get('JWT_SECRET_ACCESS');
        const exp = this.configService.get('JWT_EXPIRES_IN');
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: exp,
            secret: secret
        });
        return {
            expiresIn: exp,
            access_token: token
        }
    }
    async findUserById(id: number){
        return await this.userService.getUserByID(id);
    }
    async userOfline(email: string){
        return await this.userService.updateUsers({
            email: email
        },{
            online: false,
            status: 'offline'
        })
    }
    async userOnline(email: string){
        return await this.userService.updateUsers({
            email: email
        },{
            online: true,
            status: 'online'
        })
    }
    async turnOnTfa(email: string)  {
        return await this.userService.updateUsers(
            {email: email},
            {twoFact: true}
        )
    }
    async turnOffTfa(email: string)  {
        return await this.userService.updateUsers(
            {email: email},
            {twoFact: false, tfaSecret: null}
        )
    }
   
}