import { Injectable } from '@nestjs/common';
import { DatabaseRepository } from './database.repository';
import { CartDocument as TDocument, Cart } from '../model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CartRepository extends DatabaseRepository<Cart> {
  constructor(
    @InjectModel(Cart.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
