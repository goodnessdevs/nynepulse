import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AlertsProcessor } from './alerts.processor';
import { TermiiService } from './termii.service';
import { ResendService } from './resend.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'alerts' }),
  ],
  providers: [AlertsService, AlertsProcessor, TermiiService, ResendService],
  controllers: [AlertsController],
  exports: [AlertsService], // exported so TelemetryService can trigger alerts
})
export class AlertsModule {}