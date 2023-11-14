import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { toFileStream} from 'qrcode'
import { Response } from 'express';
import { User } from 'src/api/users/user.entity';
import { UsersService } from 'src/api/users/users.service';

@Injectable()
export class TfaService {
    constructor(private readonly userService: UsersService,
                private readonly config: ConfigService){}
    async generateTfaSecret(user: User){
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.email,
            this.config.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
            secret);
        await this.userService.updateUsers(
            {userID: user.userID},
            {tfaSecret: secret}
        )
        return {secret, otpauthUrl}
    }
    async pipeQrCodeStream(stream: Response, otpauthUrl: string)    {
        console.log("PIPEQRCODESTREAM in tfa service")
        return await toFileStream(stream, otpauthUrl)
    }
    isTfaCodeValid(tfaCode: string, user: User) {
        return authenticator.verify({
            token: tfaCode,
            secret: user.tfaSecret
        })
    }

}
