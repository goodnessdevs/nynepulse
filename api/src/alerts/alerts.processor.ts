import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TermiiService } from './termii.service';
import { ResendService } from './resend.service';

@Processor('alerts')
@Injectable()
export class AlertsProcessor {
  constructor(
    private prisma: PrismaService,
    private termiiService: TermiiService,
    private resendService: ResendService,
  ) {}

  @Process('send-alert')
  async handleAlert(job: Job<{ deviceId: string; message: string }>) {
    const { deviceId, message } = job.data;

    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
      include: { user: true },
    });

    if (!device) return;

    // Save to DB
    await this.prisma.alert.create({ data: { deviceId, message } });

    // Fire SMS + Email in parallel
    await Promise.all([
      device.user.phone
        ? this.termiiService.sendSms(device.user.phone, message)
        : Promise.resolve(),
      device.user.email
        ? this.resendService.sendEmail(
            device.user.email,
            '⚠️ NynePulse Device Alert',
            message,
          )
        : Promise.resolve(),
    ]);

    console.log(`🚨 Alert fired for device ${device.name}: ${message}`);
  }
}