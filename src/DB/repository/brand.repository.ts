import { Injectable } from '@nestjs/common';
import { DatabaseRepository } from './database.repository';
import { BrandDocument as TDocument, Brand } from '../model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BrandRepository extends DatabaseRepository<Brand> {
  constructor(
    @InjectModel(Brand.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
