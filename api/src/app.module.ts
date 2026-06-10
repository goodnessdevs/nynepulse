import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { createKeyv } from '@keyv/redis';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { DevicesModule } from './devices/devices.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import config from './config/config';
import { GatewayModule } from './gateway/gateway.module';
import { RedisCacheModule } from './cache/cache.module';
import { CommandsModule } from './commands/commands.module';
import { AlertsModule } from './alerts/alerts.module';
import { FirmwareModule } from './firmware/firmware.module';

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule.forRoot({
    cache: true,
    isGlobal: true,
    load: [config]
  }),
    ThrottlerModule.forRootAsync({
      useFactory: () => {
        return {
          throttlers: [
            {
              ttl: 60000, limit: 100, name: 'normal'
            }]
        }
      }
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        return {
          stores: [createKeyv(configService.get<string>('redis.connectionUrl'))]
        }
      },
      inject: [ConfigService]
    }),
    DevicesModule,
    GatewayModule,
    TelemetryModule,
    RedisCacheModule,
    CommandsModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: 6379,
      },
    }),
    AlertsModule,
    FirmwareModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*')
  }
}
