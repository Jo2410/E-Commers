import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { IsMatch } from 'src/common/decorators/match.custom.decorator';



export class ResendConfirmEmailDto {
  constructor(){}
  @IsEmail()
  email:string
}
export class ConfirmEmailDto extends ResendConfirmEmailDto {
  @Matches(/^\d{6}$/)
  code:string
}

export class loginBodyDto extends ResendConfirmEmailDto {
  @IsStrongPassword()
  password: string;
}

export class SignupBodyDto extends loginBodyDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 52, {
    message: 'username min length is 2 char and max length is 52 char',
  })
  username: string;

  @ValidateIf((data: SignupBodyDto) => {
    return Boolean(data.password);
  })
  @IsMatch<string>(
    ['password'],
    // {message:"confirm password not identical with password"}
  )
  confirmPassword: string;
}

export class signupQueryDto {
  @MinLength(2)
  @IsString()
  flag: string;
}
