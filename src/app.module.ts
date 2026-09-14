import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PinoLoggerModule } from './config/logger/logger.module';
import { AppThrottlerModule } from './config/throttler/throttler.module';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { validateEnv } from './config/env.validation';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { CorrelationIdMiddleware } from './shared/middlewares/correlation-id.middlewares';
import { allConfigs } from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/database/typeorm-config.service';
import { UserModule } from './apps/user/user.module';
import { AuthModule } from './apps/auth/auth.module';
import { AddressModule } from './apps/address/address.module';
import { CategoryModule } from './apps/category/category.module';
import { ProductModule } from './apps/product/product.module';
import { ProductImageModule } from './apps/product-image/product-image.module';

const envFile = process.env.NODE_ENV === 'production' ? [".env.prod", '.env'] : [".env.dev", '.env'];

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: envFile,
    cache: true,
    isGlobal: true,
    validate: validateEnv,
    load: allConfigs,
  }), PinoLoggerModule, AppThrottlerModule, TypeOrmModule.forRootAsync(
    {
      useClass: TypeOrmConfigService,
    }
  ), UserModule, AuthModule, AddressModule, CategoryModule, ProductModule, ProductImageModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
