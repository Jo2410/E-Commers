import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandRepository } from 'src/DB';

@Module({
  controllers: [BrandController],
  providers: [BrandService,BrandRepository],
})
export class BrandModule {}
