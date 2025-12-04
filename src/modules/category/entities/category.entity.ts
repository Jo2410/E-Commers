import { ICategory } from "src/common";

export class CategoryResponse {
    category:ICategory
}

export class GetAllResponse {
    result:{
        docsCount?:number,
        limit?:number,
        pages?:number,
        currentPage?:number |undefined ,
        result:ICategory[]
      }}
