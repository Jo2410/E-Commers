import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import {
  UpdateProductAttachmentDto,
  UpdateProductDto,
} from './dto/update-product.dto';
import {
  BrandRepository,
  CategoryDocument,
  CategoryRepository,
  ProductDocument,
  UserDocument,
} from 'src/DB';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { FolderEnum, S3Service } from 'src/common';
import { randomUUID } from 'node:crypto';
import { Types } from 'mongoose';

@Injectable()
export class ProductService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly brandRepository: BrandRepository,
    private readonly productRepository: ProductRepository,
    private readonly s3service: S3Service,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    user: UserDocument,
  ): Promise<ProductDocument> {
    console.log({ d: createProductDto });
    const { name, description, discountPercent, originalPrice, stock } =
      createProductDto;
    const category = await this.categoryRepository.findOne({
      filter: { _id: createProductDto.category },
    });
    if (!category) {
      throw new NotFoundException('fail to find matching category instance');
    }
    createProductDto.category = category._id;

    const brand = await this.brandRepository.findOne({
      filter: { _id: createProductDto.brand },
    });
    if (!brand) {
      throw new NotFoundException('fail to find matching brand instance');
    }
    createProductDto.brand = brand._id;
    const assetFolderId = randomUUID();
    const images = await this.s3service.uploadFiles({
      files,
      path: `${FolderEnum.Category}/${createProductDto.category}/${FolderEnum.Product}/${assetFolderId}`,
    });

    const [product] = await this.productRepository.create({
      data: [
        {
          category: category._id,
          brand: brand._id,
          name,
          description,
          discountPercent,
          originalPrice,
          salePrice: originalPrice - originalPrice * (discountPercent / 100),
          stock,
          assetFolderId,
          images,
          createdBy: user._id,
        },
      ],
    });

    if (!product) {
      throw new BadRequestException('Fail to crate this product instance');
    }

    return product;
  }

  async update(
    productId: Types.ObjectId,
    updateProductDto: UpdateProductDto,
    user: UserDocument,
  ):Promise<ProductDocument> {
    const product = await this.productRepository.findOne({
      filter: { _id: productId },
    });
    if (!product) {
      throw new NotFoundException('Fail to find matching product instance');
    }

    if (updateProductDto.category) {
      const category = await this.categoryRepository.findOne({
        filter: { _id: updateProductDto.category },
      });
      if (!category) {
        throw new NotFoundException('fail to find matching category instance');
      }
      updateProductDto.category = category._id;
    }

    if (updateProductDto.brand) {
      const brand = await this.brandRepository.findOne({
        filter: { _id: updateProductDto.brand },
      });
      if (!brand) {
        throw new NotFoundException('fail to find matching brand instance');
      }
      updateProductDto.brand = brand._id;
    }

    let salePrice = product.salePrice;
    if (updateProductDto.originalPrice || updateProductDto.discountPercent) {
      const originalPrice =
        updateProductDto.originalPrice ?? product.originalPrice;
      const discountPercent =
        updateProductDto.discountPercent ?? product.discountPercent;
      const finalPrice =
        originalPrice - originalPrice * (discountPercent / 100);
      salePrice = finalPrice > 0 ? finalPrice : 1;
    }

    const updateProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: {
        ...updateProductDto,
        salePrice,
        updatedBy: user._id,
      },
    });

    if (!updateProduct) {
      throw new BadRequestException('Fail to update this product instance');
    }

    return updateProduct;
  }

  async updateAttachment(
    productId: Types.ObjectId,
    updateProductAttachmentDto: UpdateProductAttachmentDto,
    user: UserDocument,
    files?: Express.Multer.File[],
  ):Promise<ProductDocument>{
    const product = await this.productRepository.findOne({
      filter: { _id: productId },
    });
    if (!product) {
      throw new NotFoundException('Fail to find matching product instance');
    }

    let attachments: string[] = [];
    if (files?.length) {
      attachments = await this.s3service.uploadFiles({
        files,
        path: `${(FolderEnum.Category as unknown as CategoryDocument).assetFolderId}/${FolderEnum.Product}/${product.assetFolderId}`,
      });
    }

    const removeAttachments=[... new Set(updateProductAttachmentDto.removeAttachments??[])]



    const updateProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: [
        {
          $set:{
            updatedBy:user._id,
            images:{
              $setUnion:[
                {
                  $setDifference:[
                    "$images",
                    removeAttachments
                  ]
                },
                attachments
              ]
            }
          }
        }
      ],
    });

    

    if (!updateProduct) {
      await this.s3service.deleteFiles({urls:attachments})
      throw new BadRequestException('Fail to update this product instance');
    }
    await this.s3service.deleteFiles({urls:removeAttachments})

    return updateProduct;
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
