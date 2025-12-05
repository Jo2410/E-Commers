import { PartialType } from '@nestjs/mapped-types';

import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Validate,
} from 'class-validator';
import { Types } from 'mongoose';
import { ContainField, mongoDBIds } from 'src/common';
import { Type } from 'class-transformer';
import { CreateCategoryDto } from './create-category.dto';
import { Optional } from '@nestjs/common';

@ContainField()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @Validate(mongoDBIds)
  @Optional()
  removeBrands?:Types.ObjectId[]
}

export class CategoryParamsDto {
  @IsMongoId()
  categoryId: Types.ObjectId;
}

export class GetAllDto {
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  page: number;

  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  size: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  search: string;
}
