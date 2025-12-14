import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { CartDocument, CartRepository, UserDocument } from 'src/DB';
import { lean } from 'src/DB/repository/database.repository';

@Injectable()
export class CartService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
  ) {}
  async create(createCartDto: CreateCartDto, user: UserDocument):Promise<{status:number;cart:CartDocument|lean<CartDocument>}> {
    const product = await this.productRepository.findOne({
      filter: {
        _id: createCartDto.productId,
        stock: { $gte: createCartDto.quantity },
      },
    });
    if (!product) {
      throw new NotFoundException('Fail to find matching product instance or product is out of stock')
    }
    const cart=await this.cartRepository.findOne({filter:{createdBy:user._id}})
    if (!cart) {
      const [newCart]=await this.cartRepository.create({
        data:[{createdBy:user._id,products:[{productId:product._id,quantity:createCartDto.quantity}]}]
      })
      if (!newCart) {
        throw new BadRequestException('Fail to create user cart')
      }
      return {status:201,cart:newCart}
    }

    const CheckProductInCart=cart.products.find(product=>{
      return product.productId == createCartDto.productId
    })

    if (CheckProductInCart) {
      CheckProductInCart.quantity=createCartDto.quantity
    }else{
      cart.products.push({productId:product._id,quantity:createCartDto.quantity})
    }
    await cart.save()

    return {status:200,cart};
  }

  findAll() {
    return `This action returns all cart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
