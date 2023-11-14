import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { JwtStrategy, Strategy42, TfaStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TfaService } from './tfa/tfa.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    UsersService,
    Strategy42,
    JwtStrategy,
    TfaService,
    TfaStrategy
  ],
  imports: [
    JwtModule.register({
      // secret: process.env.JWT_SECRET_ACCESS,
      // signOptions:  {
      //   algorithm: 'HS512',
      //   expiresIn: '1d' //bit too long  .env?
      // }
    }),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    })
  ],
  exports: [
    PassportModule,
    JwtModule
  ]
})
export class AuthModule {}
