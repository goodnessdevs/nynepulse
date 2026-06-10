import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFirmwareDto {
  @ApiProperty({ example: '1.0.2' })
  @IsString()
  version: string;

  @ApiProperty({ example: 'temperature_sensor' })
  @IsString()
  deviceType: string;
}