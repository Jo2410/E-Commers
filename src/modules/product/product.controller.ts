import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ProductParamDto,
  UpdateProductAttachmentDto,
  UpdateProductDto,
} from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import {
  Auth,
  IResponse,
  StorageEnum,
  successResponse,
  User,
} from 'src/common';
import { endpoint } from './authorization';
import type { UserDocument } from 'src/DB';
import { ProductResponse } from './entities/product.entity';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      5,
      cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: StorageEnum.disk,
      }),
    ),
  )
  @Auth(endpoint.create)
  @Post()
  async create(
    @UploadedFiles(ParseFilePipe) files: Express.Multer.File[],
    @User() user: UserDocument,
    @Body() createProductDto: CreateProductDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.create(
      createProductDto,
      files,
      user,
    );

    return successResponse<ProductResponse>({ status: 201, data: { product } });
  }

  @Auth(endpoint.create)
  @Patch(':productId')
  async update(
    @Param() params: ProductParamDto,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: UserDocument,
  ):Promise<IResponse<ProductResponse>> {
    const product = await this.productService.update(
      params.productId,
      updateProductDto,
      user,
    );
    return successResponse<ProductResponse>({data:{product}})
  }

  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      5,
      cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: StorageEnum.disk,
      }),
    ),
  )
  @Auth(endpoint.create)
  @Patch(':productId/attachment')
  async updateAttachment(
    @Param() params: ProductParamDto,
    @Body() updateProductAttachmentDto: UpdateProductAttachmentDto,
    @User() user: UserDocument,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: false }))
    files: Express.Multer.File[],
  ):Promise<IResponse<ProductResponse>> {
    const product = await this.productService.updateAttachment(
      params.productId,
      updateProductAttachmentDto,
      user,
      files,
    );
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
