import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthenticationController } from './auth.controller';
import {
  OtpModel,
  OtpRepository,
} from 'src/DB';
import { securityService } from 'src/common';


@Module({
  imports: [ OtpModel],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, OtpRepository, securityService],
  exports: [],
})
export class AuthenticationModule {}
