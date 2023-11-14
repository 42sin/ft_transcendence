import { Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class CorsMiddleware implements NestMiddleware   {
    constructor(private config: ConfigService){}
    use(req: Request, res: Response, next: NextFunction)    {
        const origin = `http://${this.config.get('IP')}:${this.config.get('PORT')}`
        console.log('MIDLEWARW:', origin)
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        next();
    }
}