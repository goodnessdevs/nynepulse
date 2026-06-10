import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendCommandDto {
  @ApiProperty({ example: 'TURN_OFF' })
  @IsString()
  instruction: string;
}