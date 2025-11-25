import {
  Controller,
  Get,
  Headers,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IUser, RoleEnum, StorageEnum, User } from 'src/common';
import { Auth } from 'src/common/decorators/auth.decorator';
import type { UserDocument } from 'src/DB';
import { preferredLanguageInterceptor } from 'src/common/interceptors';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation, localFileUpload } from 'src/common/utils/multer';
import type { IMulterFile } from '../../common/interfaces/multer.interface';

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



  @UseInterceptors(
    FileInterceptor(
      'profileImage',
      cloudFileUpload({
        storageApproach:StorageEnum.disk,
        validation: fileValidation.image,
        fileSize: 2,
      }),
    ),
  )
  @Auth([RoleEnum.user])
  @Patch('profile-image')
  async profileImage(
    @User() user:UserDocument,
    
    @UploadedFile
    (ParseFilePipe) 
  file: Express.Multer.File):Promise<{message:string;data:{profile:IUser}}> {
    const profile=await this.userService.profileImage(file,user)
    return { message: 'Done', data:{profile} };
  }



}
