import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../gateway/events.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PublishTelemetryDto } from './dto/publish-telemetry.dto';
import { RedisService } from '../cache/redis.service';
import { AlertsService } from 'src/alerts/alerts.service';

@Injectable()
export class TelemetryService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private redisService: RedisService,
    private alertsService: AlertsService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) { }

  async publish(device: any, dto: PublishTelemetryDto) {
    console.log('Device userId:', device.userId);
    // 1. Save telemetry to DB
    const telemetry = await this.prisma.telemetry.create({
      data: { deviceId: device.id, payload: dto.payload ?? (dto as any) },
    });

    // 2. Update device status + lastSeenAt
    await this.prisma.device.update({
      where: { id: device.id },
      data: { status: 'ONLINE', lastSeenAt: new Date() },
    });

    // 3. Cache latest telemetry — expires in 30s (Redis TTL trick)
    // If device stops publishing, it auto-appears OFFLINE
    await this.redisService.set(`device:${device.id}:latest`, dto.payload, 30);
    await this.redisService.set(`device:${device.id}:status`, 'ONLINE', 30);

    // 4. Emit to dashboard via WebSocket
    this.eventsGateway.emitTelemetry(device.userId, device.id, dto.payload);

    // 5. Check alert thresholds
    await this.checkThresholds(device, dto.payload ?? (dto as any));

    return telemetry;
  }

  async getHistory(deviceId: string, limit = 50) {
    return this.prisma.telemetry.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private async checkThresholds(device: any, payload: Record<string, any>) {
    if (payload.temp && payload.temp > 50) {
      await this.alertsService.triggerAlert(
        device.id,
        `⚠️ Device "${device.name}" is overheating: ${payload.temp}°C`
      );
    }

    if (payload.humidity && payload.humidity > 90) {
      await this.alertsService.triggerAlert(
        device.id,
        `💧 Device "${device.name}" humidity critical: ${payload.humidity}%`
      );
    }
  }
}