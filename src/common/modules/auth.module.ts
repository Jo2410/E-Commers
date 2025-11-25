import { Global, Module } from '@nestjs/common';
import {
  TokenModel,
  TokenRepository,
  UserModel,
  UserRepository,
} from 'src/DB';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/utils/security/token.service';
import { BrandModule } from 'src/modules/brand/brand.module';

@Global()
@Module({
  imports: [UserModel, TokenModel, BrandModule],
  controllers: [],
  providers: [
    UserRepository,
    JwtService,
    TokenService,
    TokenRepository,
  ],
  exports: [   
    UserRepository,
    JwtService,
    TokenService,
    TokenRepository,
    TokenModel,
    UserModel,
  ],
})
export class SharedAuthenticationModule {}
