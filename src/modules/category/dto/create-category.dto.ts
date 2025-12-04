import { IsString, MaxLength, MinLength } from "class-validator";
import { ICategory } from "src/common";

export class CreateCategoryDto implements Partial<ICategory> {

    @MaxLength(25)
    @MinLength(2)
    @IsString()
    name:string;

    @MaxLength(25)
    @MinLength(2)
    @IsString()
    slogan:string;


}
