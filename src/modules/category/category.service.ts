import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetAllDto, UpdateCategoryDto } from './dto/update-category.dto';
import { FolderEnum, S3Service } from 'src/common';
import {
  CategoryRepository,
  CategoryDocument,
  UserDocument,
  BrandRepository,
} from 'src/DB';
import { Types } from 'mongoose';
import { lean } from 'src/DB/repository/database.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly CategoryRepository: CategoryRepository,
    private readonly brandRepository: BrandRepository,
    private readonly s3Service: S3Service,
  ) {}
  async create(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<CategoryDocument> {
    const { name } = createCategoryDto;
    const checkDuplicated = await this.CategoryRepository.findOne({
      filter: { name, paranoid: false },
    });
    if (checkDuplicated) {
      throw new ConflictException(
        checkDuplicated.freezedAt
          ? 'Duplicated with archived Category'
          : 'Duplicated Category name',
      );
    }
    const brands: Types.ObjectId[] = [
      ...new Set(createCategoryDto.brands || []),
    ];

    if (
      brands &&
      (await this.brandRepository.find({ filter: { _id: { $in: brands } } }))
        .length != brands.length
    ) {
      throw new NotFoundException('some of mentioned brands does not exist');
    }

    let assetFolderId: string = randomUUID();
    const image = await this.s3Service.uploadFile({
      file,
      path: `${FolderEnum.Category}/${assetFolderId}`,
    });

    const [Category] = await this.CategoryRepository.create({
      data: [
        {
          ...createCategoryDto,
          image,
          assetFolderId,
          createdBy: user._id,
          brands: brands.map((brand) => {
            return Types.ObjectId.createFromHexString(
              brand as unknown as string,
            );
          }),
        },
      ],
    });

    if (!Category) {
      await this.s3Service.deleteFile({ Key: image });
      throw new BadRequestException('Fail to create this Category resource');
    }

    return Category;
  }

  async update(
    CategoryId: Types.ObjectId,
    updateCategoryDto: UpdateCategoryDto,
    user: UserDocument,
  ): Promise<CategoryDocument | lean<CategoryDocument>> {
    if (
      updateCategoryDto &&
      (await this.CategoryRepository.findOne({
        filter: { name: updateCategoryDto.name },
      }))
    ) {
      throw new ConflictException('Duplicated Category name ');
    }

    const Category = await this.CategoryRepository.findOneAndUpdate({
      filter: { _id: CategoryId },
      update: {
        ...updateCategoryDto,
        updatedBy: user._id,
      },
    });

    if (!Category) {
      throw new NotFoundException('Fail to find matching Category instance ');
    }

    return Category;
  }

  async updateAttachment(
    CategoryId: Types.ObjectId,
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<CategoryDocument | lean<CategoryDocument>> {
    const image = await this.s3Service.uploadFile({
      file,
      path: FolderEnum.Category,
    });
    const Category = await this.CategoryRepository.findOneAndUpdate({
      filter: { _id: CategoryId },
      update: {
        image,
        updatedBy: user._id,
      },
      options: { new: false },
    });

    if (!Category) {
      await this.s3Service.deleteFile({ Key: image });
      throw new NotFoundException('Fail to find matching Category instance ');
    }

    await this.s3Service.deleteFile({ Key: Category.image });
    Category.image = image;
    return Category;
  }

  async freeze(
    CategoryId: Types.ObjectId,
    user: UserDocument,
  ): Promise<string> {
    const Category = await this.CategoryRepository.findOneAndUpdate({
      filter: { _id: CategoryId },
      update: {
        freezedAt: new Date(),
        $unset: { restoredAt: true },
        updatedBy: user._id,
      },
      options: { new: false },
    });

    if (!Category) {
      throw new NotFoundException('Fail to find matching Category instance ');
    }

    return 'Done';
  }

  async remove(
    CategoryId: Types.ObjectId,
    user: UserDocument,
  ): Promise<string> {
    const Category = await this.CategoryRepository.findOneAndDelete({
      filter: {
        _id: CategoryId,
        paranoid: false,
        freezedAt: { $exists: true },
      },
    });

    if (!Category) {
      throw new NotFoundException('Fail to find matching Category instance ');
    }
    await this.s3Service.deleteFile({ Key: Category.image });
    return 'Done';
  }

  async restore(
    CategoryId: Types.ObjectId,
    user: UserDocument,
  ): Promise<CategoryDocument | lean<CategoryDocument>> {
    const Category = await this.CategoryRepository.findOneAndUpdate({
      filter: {
        _id: CategoryId,
        paranoid: false,
        freezedAt: { $exists: true },
      },
      update: {
        restoredAt: new Date(),
        $unset: { freezedAt: true },
        updatedBy: user._id,
      },
      options: { new: false },
    });

    if (!Category) {
      throw new NotFoundException('Fail to find matching Category instance ');
    }

    return Category;
  }

  async findAll(
    data: GetAllDto,
    archive: boolean = false,
  ): Promise<{
    docsCount?: number;
    limit?: number;
    pages?: number;
    currentPage?: number | undefined;
    result: CategoryDocument[] | lean<CategoryDocument>[];
  }> {
    const { page, size, search } = data;
    const result = await this.CategoryRepository.paginate({
      filter: {
        ...(search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { slogan: { $regex: search, $options: 'i' } },
              ],
            }
          : {}),
        ...(archive ? { paranoid: false, freezedAt: { $exists: true } } : {}),
      },
      page,
      size,
    });
    return result;
  }

  async findOne(
    CategoryId: Types.ObjectId,
    archive: boolean = false,
  ): Promise<CategoryDocument | lean<CategoryDocument>> {
    const Category = await this.CategoryRepository.findOne({
      filter: {
        _id: CategoryId,

        ...(archive ? { paranoid: false, freezedAt: { $exists: true } } : {}),
      },
    });

    if (!Category) {
      throw new NotFoundException('Fail to finds matching Category instance');
    }
    return Category;
  }
}
