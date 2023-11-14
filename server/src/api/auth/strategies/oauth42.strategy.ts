import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from 'passport-42'
import { AuthService } from "../auth.service";
import { UserDetails } from "../utils";

@Injectable()
export class Strategy42 extends PassportStrategy(Strategy, '42'){
    constructor(readonly config: ConfigService,
                private readonly authService: AuthService){
        super({
            clientID: config.get('FORTYTWO_APP_ID'),
            clientSecret: config.get('FORTYTWO_APP_SECRET'),
            callbackURL: config.get('CB_URL'),
            scope: ['public']
        });
    }
    async validate(_accessToken: string, _refreshToken: string, profile: Profile){
    //    console.log({profile,});
       const details: UserDetails = {
            email: profile.emails[0].value,
            username: profile.username
       }
        let user = await this.authService.validateUser(details);
        console.log("strategy validate")
        console.log(user);
        if (!user.online)   {
            await this.authService.userOnline(user.email);
            user.online = true;
            // console.log(user, 'savred ass online');
        }
        return user;
    }
}