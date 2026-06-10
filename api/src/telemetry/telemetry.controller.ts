import { Controller, Post, Get, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TelemetryService } from './telemetry.service';
import { PublishTelemetryDto } from './dto/publish-telemetry.dto';
import { DeviceAuthGuard } from '../auth/guards/device-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Telemetry')
@Controller('telemetry')
export class TelemetryController {
  constructor(private telemetryService: TelemetryService) {}

  // Devices call this endpoint to publish data
  @ApiBearerAuth()
  @UseGuards(DeviceAuthGuard)
  @Post()
  publish(@Request() req, @Body() dto: PublishTelemetryDto) {
    return this.telemetryService.publish(req.device, dto);
  }

  // Dashboard calls this to get historical data
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':deviceId/history')
  getHistory(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit?: number,
  ) {
    return this.telemetryService.getHistory(deviceId, limit);
  }
}