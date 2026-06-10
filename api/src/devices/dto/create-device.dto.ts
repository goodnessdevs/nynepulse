import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({ example: 'Temperature Sensor 01' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'temperature_sensor' })
  @IsString()
  type: string;

  @ApiProperty({ example: { location: 'Room A' }, required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}