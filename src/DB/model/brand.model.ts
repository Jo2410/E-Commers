import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IBrand } from 'src/common';
import slugify from 'slugify';

@Schema()
export class Brand implements IBrand {
  @Prop({
    type: String,
    required: true,
    unique: true,
    minLength: 2,
    maxLength: 25,
  })
  name: string;
  @Prop({ type: String, minlength: 2, maxLength: 50 })
  slug: string;
  @Prop({ type: String, required: true, minlength: 2, maxlength: 25 })
  slogan: string;
  @Prop({ type: String, required: true })
  image: string;
  @Prop({ Type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export type BrandDocument = HydratedDocument<Brand>;
const brandSchema = SchemaFactory.createForClass(Brand);
brandSchema.pre(
  'save',
  async function (
    next,
  ) {
    if (this.isModified('name')) {
      this.slug=slugify(this.slug)
    }
    next();
  },
);


export const BrandModel = MongooseModule.forFeature([
  { name: Brand.name, schema: brandSchema },
]);
