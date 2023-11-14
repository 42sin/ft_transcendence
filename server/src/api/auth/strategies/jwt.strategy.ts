import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/api/users/users.service";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "../utils";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(private readonly userService: UsersService,
                readonly configService: ConfigService){
        console.log("SCERTE SECRET", configService.get('JWT_SECRET_ACCESS'));
        super({
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET_ACCESS'),
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) =>   {
                    console.log(request?.cookies?.Authentication)
                    return request?.cookies?.Authentication;
                }
            ])
        })
    }
    async validate(payload: JwtPayload, req: Request)  {
        if (!payload){
            throw new UnauthorizedException();
        }
        const user = await this.userService.getUserByEmail(payload.email);
        if (!user)  {
            throw new UnauthorizedException();
        }
        req.user = user;
        return req.user;
    }
}