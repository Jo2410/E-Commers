import { IsMongoId } from "class-validator";
import { Types } from "mongoose";
import { ContainField } from "src/common";
import { CreateProductDto } from "./create-product.dto";
import { PartialType } from "@nestjs/mapped-types";


@ContainField()
export class UpdateProductDto extends PartialType (CreateProductDto){}

export class ProductParamDto {
    @IsMongoId()
    productId:Types.ObjectId
}