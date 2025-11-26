import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandDocument, BrandRepository, UserDocument } from 'src/DB';
import { S3Service } from 'src/common';
import { Types } from 'mongoose';
import { UpdateBrandDto } from './dto/update-brand.dto';
// import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository,private readonly s3Service:S3Service) {}
  async create(
    createBrandDto: CreateBrandDto,
    file: Express.Multer.File,
    user: UserDocument,
  ):Promise<BrandDocument>{
    const {name,slogan}=createBrandDto;
    const checkDuplicated=await this.brandRepository.findOne({
      filter:{name}
    })
    if (checkDuplicated) {
      throw new ConflictException("Duplicated brand name")
    }

    const image=await this.s3Service.uploadFile({
      file,
      path:`Brand`
    })

    const [brand]=await this.brandRepository.create({
      data:[{name,slogan,image,createdBy:user._id}]
    })

    if (!brand) {
      await this.s3Service.deleteFile({Key:image});
      throw new BadRequestException('Fail to create this brand resource')
    }
    
    return brand;
  }

  update(brandId: Types.ObjectId, updateBrandDto: UpdateBrandDto) {
    return `This action updates a #${brandId} brand`;
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
