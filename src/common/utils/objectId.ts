import { Types } from "mongoose"


export const parseObjectId=(value:string)=>{
    return Types.ObjectId.createFromHexString(value as string)
}