import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { S3Service } from './common';
import { BrandModule } from './modules/brand/brand.module';
import { CartModule } from './modules/cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.development'),
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 30000,
    }),
    AuthenticationModule,
    UserModule,
    CategoryModule,
    ProductModule,
    BrandModule,
    CartModule
  ],
  controllers: [AppController],
  providers: [AppService,S3Service],
})
export class AppModule {}
