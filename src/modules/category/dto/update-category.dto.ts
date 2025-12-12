import { PartialType } from '@nestjs/mapped-types';

import {
  IsMongoId,
  Validate,
} from 'class-validator';
import { Types } from 'mongoose';
import { ContainField, mongoDBIds } from 'src/common';
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


