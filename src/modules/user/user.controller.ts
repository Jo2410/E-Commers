import {
  Controller,
  Get,
  Headers,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RoleEnum, User } from 'src/common';
import { Auth } from 'src/common/decorators/auth.decorator';
import type { UserDocument } from 'src/DB';
import { preferredLanguageInterceptor } from 'src/common/interceptors';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(preferredLanguageInterceptor)
  @Auth([RoleEnum.admin, RoleEnum.user])
  @Get()
  profile(
    @Headers() header: any,
    @User() user: UserDocument,
  ): {
    message: string;
  } {
    console.log({
      lang: header['accept-language'],
      user,
    });
    return { message: 'Done' };
  }
}
