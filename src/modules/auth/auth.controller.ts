import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import {
  ConfirmEmailDto,
  loginBodyDto,
  ResendConfirmEmailDto,
  SignupBodyDto,
} from './dto/auth.dto';
import { LoginResponse } from './entities/auth.entity';

// @UsePipes(new ValidationPipe({
//             whitelist:true,
//             forbidNonWhitelisted:true,
//             // stopAtFirstError:true,
//         // dismissDefaultMessages:true,
//         // disableErrorMessages:true,
//         // skipUndefinedProperties:true,
//         // skipNullProperties:true,
//         // skipMissingProperties:true
//         }))

@Controller('/auth')
export class AuthenticationController {
  constructor(private readonly AuthenticationService: AuthenticationService) {}

  @Post('signup')
  async signup(
    @Body()
    body: SignupBodyDto,
  ): Promise<{ message: string }> {
    console.log({ body });

    await this.AuthenticationService.signup(body);

    return { message: 'Done' };
  }

  @Post('resend-confirm-email')
  async resendConfirmEmail(
    @Body()
    body: ResendConfirmEmailDto,
  ): Promise<{ message: string }> {
    console.log({ body });

    await this.AuthenticationService.resendConfirmEmail(body);

    return { message: 'Done' };
  }

  @Patch('confirm-email')
  async confirmEmail(
    @Body()
    body: ConfirmEmailDto,
  ): Promise<{ message: string }> {
    console.log({ body });

    await this.AuthenticationService.confirmEmail(body);

    return { message: 'Done' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: loginBodyDto):Promise<LoginResponse> {
    const credentials = await this.AuthenticationService.login(body);
    return { message: 'Done', data: { credentials } };
  }
}
