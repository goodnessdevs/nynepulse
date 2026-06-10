import { Allow } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishTelemetryDto {
  @ApiProperty({ example: { temp: 36.5, humidity: 78 } })
  @Allow()
  payload: Record<string, any>;
}