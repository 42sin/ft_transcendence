import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/api/users/users.service";
import { JwtPayload } from "../utils";

@Injectable()
export class TfaStrategy extends PassportStrategy(Strategy, 'tfa'){
    constructor(private readonly config: ConfigService,
                private readonly userService: UsersService){
        super({
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET_ACCESS'),
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    console.log('tfa startegy', req?.cookies?.Authentication)
                    return req?.cookies?.Authentication;
                }
            ])
        })
    }
    async validate (payload: JwtPayload, req: Request)  {
        if (!payload)   {
            throw new UnauthorizedException();
        }
        const user = await this.userService.getUserByID(payload.sub);
		if (!user) {
			throw new UnauthorizedException();
		}
        if (!user.twoFact)  {
            return user;
        }
        if (payload.tfa)    {
            return user
        }
    }
}