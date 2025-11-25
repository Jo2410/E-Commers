import { Types } from 'mongoose';
import { OtpEnum } from '../enums';
import { IUser } from './user.interface';

export interface IOtp {
  _id?: Types.ObjectId;
  createdBy: Types.ObjectId | IUser;
  expiresAt: Date;
  type: OtpEnum;



  createdAt?: Date;
  updatedAt?: Date;
}
