import { Global, Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthenticationController } from './auth.controller';
import {
  OtpModel,
  OtpRepository,
  UserModel,
  UserRepository,
  TokenModel, 
  TokenRepository, 
} from 'src/DB';
import { securityService } from 'src/common';
import { TokenService } from 'src/common/utils/security/token.service'; 
import { JwtService } from '@nestjs/jwt'; 

@Global()
@Module({
  imports: [OtpModel, UserModel, TokenModel], 
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    OtpRepository,
    securityService,
    UserRepository,
    TokenService, 
    JwtService,
    TokenRepository, 
  ],
  exports: [
    UserRepository,
    UserModel,
    TokenService, 
    TokenRepository, 
  ],
})
export class AuthenticationModule {}