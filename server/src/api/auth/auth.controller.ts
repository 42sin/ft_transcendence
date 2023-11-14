import { Controller, Get, Post,
   Redirect, Req, Res, UseGuards, Body, UnauthorizedException } from '@nestjs/common';
import { CurrentUserGuard, OauthGuard } from './guards';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtPayload, TfaCodeDto } from './utils';
import { CurrentUser } from './decorators';
import { User } from '../users/user.entity';
import { TfaService } from './tfa/tfa.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService,
               private readonly tfaService: TfaService){}

   @Get('42/login')
   @UseGuards(AuthGuard('42'))
   login(@Req() _req){
        return;
    }

    @Get('42/redirect')
    @UseGuards(AuthGuard('42'))
    async redirect(@Req() req: Request, @Res({ passthrough: true }) res: Response){
         console.log("AT REDIRECT")
         console.log(req.user)
        //  return;
         const payload: JwtPayload = {
            sub: req.user['userID'], 
            email: req.user['email'],
            tfa: false
         };
         const {expiresIn, access_token} = await this.authService.signToken(payload)
         // res.cookie('IsAuthenticated', true,{
         //    maxAge: 2*60*60*1000,
         //    httpOnly: true,
         //    sameSite: 'lax'
         // });
         res.cookie('Authentication', access_token, {
            httpOnly: true,
            maxAge: 24*60*60*1000,
            sameSite: 'lax'
         })
         if (req.user['twoFact']){
            res.redirect('/QR')
         }  else  {
            res.redirect('/')
         }
    }
   @Get('status')
   // @UseGuards(AuthGuard('jwt'))
   @UseGuards(AuthGuard('tfa'))
   @UseGuards(CurrentUserGuard)
   status(@CurrentUser() user: User, @Req() _req: Request, @Res({passthrough: true}) _res: Response){
      if (user){
         delete user.tfaSecret;
      }
      console.log(user)
      return { status: !!user, user}
   }
   
   //  @Get('logout')//post??
    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(CurrentUserGuard)
    async logout(@CurrentUser() user: User,
            @Req() req: Request, @Res(/*{ passthrough: true }*/) res: Response){
      res.clearCookie('Authentication');
      // res.clearCookie('IsAuthenticated');
      await this.authService.userOfline(user.email)
      console.log("LOGOUT", await this.authService.findUserById(user.userID));
      //TODO WTF circular exception here?? ok so it was in passthrought
      return res.status(200).send({
         success: true
      })
    }
   //TODO 2fa

   @Post('tfa/generate')
   @UseGuards(AuthGuard('jwt'))
   @UseGuards(CurrentUserGuard)
   async register(@CurrentUser() user: User,
         @Req() req: Request, @Res(/*{ passthrough: true }*/) res: Response){
      
      console.log("tfa/generate")
      const { otpauthUrl } = await this.tfaService.generateTfaSecret(user);
      console.log(otpauthUrl);
      res.setHeader('content-type', 'image/png')
      return await this.tfaService.pipeQrCodeStream(res, otpauthUrl)
   }
   @Post('tfa/turn-on')
   @UseGuards(AuthGuard('jwt'))
   @UseGuards(CurrentUserGuard)
   async turnOnTfa(@CurrentUser() user: User,
         // @Body() { tfaCode }: TfaCodeDto,
         @Body() body: any, 
         @Res(/*{ passthrough: true }*/) res: Response){
      const regex = /^\d{6}$/;
      const tfaCode = body.tfaCode;
      // console.log(body)
      console.log('THE CONE ON TURN ON', tfaCode);
      if (!regex.test(tfaCode))  {
         throw new UnauthorizedException('Wrong authentication code format'); 
      }
      const isValidCode = this.tfaService.isTfaCodeValid(tfaCode, user)
      if (!isValidCode) {
         throw new UnauthorizedException('Wrong authentcation code');
      }
      await this.authService.turnOnTfa(user.email);
      const payload: JwtPayload = {
         sub: user['userID'], 
         email: user['email'],
         tfa: true
      };
      const {expiresIn, access_token} = await this.authService.signToken(payload)
      res.cookie('Authentication', access_token, {
      httpOnly: true,
      maxAge: 24*60*60*1000,
      sameSite: 'lax'
   })
      return res.status(200).send({
         success: true
      }) 
   }

   @Post('tfa/authenticate')
   @UseGuards(AuthGuard('jwt'))
   @UseGuards(CurrentUserGuard)
   // @Redirect('/')
   async authenticate(@CurrentUser() user: User,
   // @Body(){ tfaCode }: TfaCodeDto,
      @Body() body: any,
         @Res() res: Response) {
      const tfaCode = body.tfaCode;
      const isValidCode = this.tfaService.isTfaCodeValid(tfaCode, user);
      console.log('tfa/auth', tfaCode)
      console.log('USER', user)
      if (!isValidCode) {
         throw new UnauthorizedException('Wrong authentication code');
      }
      if (!user.twoFact) {
         await this.authService.turnOnTfa(user.email);
      }
      const payload: JwtPayload = {
            sub: user['userID'], 
            email: user['email'],
            tfa: true
         };
      const {expiresIn, access_token} = await this.authService.signToken(payload)
      res.cookie('Authentication', access_token, {
         httpOnly: true,
         maxAge: 24*60*60*1000,
         sameSite: 'lax'
      })
      return res.status(200).send({
         success: true
      }) 
      // res.redirect()
   }
   @Post('tfa/turn-off')
   @UseGuards(AuthGuard('jwt'))
   @UseGuards(CurrentUserGuard)
   async turnOffTfa(@CurrentUser() user: User,
         // @Body() { tfaCode }: TfaCodeDto,
         @Res(/*{ passthrough: true }*/) res: Response){
      // const isValidCode = this.tfaService.isTfaCodeValid(tfaCode, user)
      // if (!isValidCode) {
         // throw new UnauthorizedException('Wrong authentcation code');
      // }
      await this.authService.turnOffTfa(user.email);
      // const payload: JwtPayload = {
      //    sub: user['userID'], 
      //    email: user['email'],
      //    tfa: false
      // };
      // const {expiresIn, access_token} = await this.authService.signToken(payload)
      // res.cookie('Authentication', access_token, {
      //    httpOnly: true,
      //    maxAge: 2*60*60*1000,
      //    sameSite: 'lax'
      // })
      return res.status(200).send({
         success: true
      }) 
   }
}
