import { Types } from "mongoose";
import { IUser } from "./user.interface";


export interface IBrand {
    name:string;
    image:string;
    slug:string;
    slogan:string;

    createdBy:Types.ObjectId|IUser;
    createdAt?:Date;
    updatedAt?:Date;
}