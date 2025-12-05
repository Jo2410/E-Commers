import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import { IBrand, ICategory, IProduct, IUser } from 'src/common';
import slugify from 'slugify';

@Schema({timestamps:true,strictQuery:true})
export class Product implements IProduct {
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
  @Prop({ type: String, minlength: 2, maxlength: 50000 })
  description: string;
  @Prop({ type: String, required: true })
  images: string[];
  @Prop({type:Number,required:true,})
  salePrice: number;
  @Prop({type:Number,required:true})
  originalPrice: number;
  @Prop({type:Number,required:true})
  stock: number;
  @Prop({type:Number,default:0})
  soldItems: number;
  @Prop({type:Number,default:0})
  discountPercent: number;
  @Prop({type:Types.ObjectId,ref:'Category',required:true})
  category: Types.ObjectId ;
  @Prop({type:Types.ObjectId,ref:'Brand',required:true})
  brand: Types.ObjectId | IBrand;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop({type:Types.ObjectId,ref:'User'})
  updatedBy: Types.ObjectId | IUser;

  @Prop({type:Date})
   freezedAt?: Date;
   @Prop({type:Date})
   restoredAt?: Date;
   
}

export type ProductDocument = HydratedDocument<Product>;
const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre(
  'save',
  async function (
    next,
  ) {
    if (this.isModified('name')) {
      this.slug=slugify(this.name)
    }
    next();
  },
);


ProductSchema.pre(
  ['updateOne','findOneAndUpdate'],
  async function (
    next,
  ) {
    const update=this.getUpdate() as UpdateQuery<ProductDocument>

    if (update.name) {
      this.setUpdate({...update,slug:slugify(update.name)})
    }

    const query=this.getQuery();
    if (query.paranoid===false) {
      this.setQuery({...query})
    }
    else{
      this.setQuery({...query,freezedAt:{$exists:false}})
    }

    next();
  },
);


ProductSchema.pre(
  ['findOne','find'],
  async function (
    next,
  ) {

    const query=this.getQuery();
    if (query.paranoid===false) {
      this.setQuery({...query})
    }
    else{
      this.setQuery({...query,freezedAt:{$exists:false}})
    }

    next();
  },
);



export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);
