import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Auth, IResponse, RoleEnum, successResponse, User } from 'src/common';
import {type UserDocument } from 'src/DB';
import { CartResponse } from './entities/cart.entity';
import {type Response } from 'express';


@Auth([RoleEnum.user])
@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}



  @Post()
  async create(
    @User() user:UserDocument,
    @Body() createCartDto: CreateCartDto,
    @Res({passthrough:true}) res:Response
  ):Promise<IResponse<CartResponse>> {
    const {cart,status}=await this.cartService.create(createCartDto,user);
    res.status(status)
    return successResponse<CartResponse>({status,data:{cart}})
  }

  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
