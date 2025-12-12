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
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  CategoryParamsDto,
  UpdateCategoryDto,
} from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import { Auth, GetAllDto, GetAllResponse, ICategory, IResponse, successResponse, User } from 'src/common';
import { endpoint } from './category.authorization';
import type { UserDocument } from 'src/DB';
import { CategoryResponse } from './entities/category.entity';

@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}))
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

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
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.create(
      createCategoryDto,
      file,
      user,
    );
    return successResponse<CategoryResponse>({
      status: 201,
      data: { category },
    });
  }

  @Get()
  async findAll(@Query() query: GetAllDto): Promise<IResponse<GetAllResponse<ICategory>>> {
    const result = await this.categoryService.findAll(query);
    return successResponse<GetAllResponse<ICategory>>({ data: { result } });
  }

  @Auth(endpoint.create)
  @Get('/archive')
  async findAllArchives(
    @Query() query: GetAllDto,
  ): Promise<IResponse<GetAllResponse<ICategory>>> {
    const result = await this.categoryService.findAll(query, true);
    return successResponse<GetAllResponse<ICategory>>({ data: { result } });
  }

  @Get(':categoryId')
  async findOne(@Param() params: CategoryParamsDto) {
    const category = await this.categoryService.findOne(params.categoryId);
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @Auth(endpoint.create)
  @Get(':categoryId/archive')
  async findOneArchive(@Param() params: CategoryParamsDto) {
    const category = await this.categoryService.findOne(
      params.categoryId,
      true,
    );
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @Auth(endpoint.create)
  @Patch(':categoryId')
  async update(
    @Param() params: CategoryParamsDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.update(
      params.categoryId,
      updateCategoryDto,
      user,
    );
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({ validation: fileValidation.image }),
    ),
  )
  @Auth(endpoint.create)
  @Patch(':categoryId/attachment')
  async updateAttachment(
    @Param() params: CategoryParamsDto,
    @UploadedFile() file: Express.Multer.File,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.updateAttachment(
      params.categoryId,
      file,
      user,
    );
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @Auth(endpoint.create)
  @Patch(':categoryId/restore')
  async restore(
    @Param() params: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.restore(
      params.categoryId,
      user,
    );
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @Auth(endpoint.create)
  @Delete(':categoryId/freeze')
  async freeze(
    @Param() params: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.categoryService.freeze(params.categoryId, user);
    return successResponse();
  }

  @Auth(endpoint.create)
  @Delete(':categoryId')
  async remove(@Param() params: CategoryParamsDto, @User() user: UserDocument) {
    await this.categoryService.remove(params.categoryId, user);
    return successResponse();
  }
}
