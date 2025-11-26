import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { Auth, IResponse, successResponse, User } from 'src/common';
import type { UserDocument } from 'src/DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import { BrandResponse } from './entities/brand.entity';
import { endpoint } from './authorization.module';
import { BrandParamsDto, UpdateBrandDto } from './dto/update-brand.dto';
// import { UpdateBrandDto } from './dto/update-brand.dto';

@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}))
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @UseInterceptors(
    FileInterceptor(
      'attachment', //=>Key
      cloudFileUpload({ validation: fileValidation.image }),
    ),
  )
  @Auth(endpoint.create)
  @Post()
  async create(
    @User() user: UserDocument,
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.create(createBrandDto, file, user);
    return successResponse<BrandResponse>({ status: 201, data: { brand } });
  }

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(+id);
  }

  @Patch(':brandId')
  update(
    @Param() params: BrandParamsDto,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandService.update(params.brandId, updateBrandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(+id);
  }
}
