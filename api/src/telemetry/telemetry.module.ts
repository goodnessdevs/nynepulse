import { Module } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { GatewayModule } from '../gateway/gateway.module';
import { AlertsModule } from 'src/alerts/alerts.module';

@Module({
  imports: [GatewayModule, AlertsModule],
  providers: [TelemetryService],
  controllers: [TelemetryController],
  exports: [TelemetryService],
})
export class TelemetryModule {}