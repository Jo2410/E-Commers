import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandDocument, BrandRepository, UserDocument } from 'src/DB';
import { FolderEnum, S3Service } from 'src/common';
import { Types } from 'mongoose';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { lean } from 'src/DB/repository/database.repository';
// import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly s3Service: S3Service,
  ) {}
  async create(
    createBrandDto: CreateBrandDto,
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<BrandDocument> {
    const { name, slogan } = createBrandDto;
    const checkDuplicated = await this.brandRepository.findOne({
      filter: { name },
    });
    if (checkDuplicated) {
      throw new ConflictException('Duplicated brand name');
    }

    const image = await this.s3Service.uploadFile({
      file,
      path: `Brand`,
    });

    const [brand] = await this.brandRepository.create({
      data: [{ name, slogan, image, createdBy: user._id }],
    });

    if (!brand) {
      await this.s3Service.deleteFile({ Key: image });
      throw new BadRequestException('Fail to create this brand resource');
    }

    return brand;
  }

  async update(
    brandId: Types.ObjectId,
    updateBrandDto: UpdateBrandDto,
    user: UserDocument,
  ): Promise<BrandDocument | lean<BrandDocument>> {
    if (
      updateBrandDto &&
      (await this.brandRepository.findOne({
        filter: { name: updateBrandDto.name },
      }))
    ) {
      throw new ConflictException('Duplicated brand name ');
    }

    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId },
      update: {
        ...updateBrandDto,
        updatedBy: user._id,
      },
    });

    if (!brand) {
      throw new NotFoundException('Fail to find matching brand instance ');
    }

    return brand;
  }

  async updateAttachment(
    brandId: Types.ObjectId,
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<BrandDocument | lean<BrandDocument>> {
    const image = await this.s3Service.uploadFile({
      file,
      path: FolderEnum.Brand,
    });
    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId },
      update: {
        image,
        updatedBy: user._id,
      },
      options:{new:false}
    });

    if (!brand) {
      await this.s3Service.deleteFile({Key:image})
      throw new NotFoundException('Fail to find matching brand instance ');
    }

    await this.s3Service.deleteFile({Key:brand.image})
    brand.image=image;
    return brand;
  }

  findAll() {
    return `This action returns all brand`;
  }

  findOne(id: number) {
    return `This action returns a #${id} brand`;
  }

  remove(id: number) {
    return `This action removes a #${id} brand`;
  }
}
