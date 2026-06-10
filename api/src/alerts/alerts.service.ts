import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(
    @InjectQueue('alerts') private alertsQueue: Queue,
    private prisma: PrismaService,
  ) {}

  // Called by TelemetryService when a threshold is breached
  async triggerAlert(deviceId: string, message: string) {
    console.log('📬 Adding alert to queue:', message);
    await this.alertsQueue.add('send-alert', { deviceId, message }, {
      attempts: 3,              // retry up to 3 times if SMS fails
      backoff: {
        type: 'exponential',
        delay: 5000,            // wait 5s, 10s, 20s between retries
      },
      removeOnComplete: true,
    });
  }

  async findAll(deviceId: string) {
    return this.prisma.alert.findMany({
      where: { deviceId },
      orderBy: { sentAt: 'desc' },
      take: 20,
    });
  }
}