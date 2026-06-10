import { Controller, Post, Patch, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommandsService } from './commands.service';
import { SendCommandDto } from '../devices/dto/send-command.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeviceAuthGuard } from '../auth/guards/device-auth.guard';

@ApiTags('Commands')
@Controller('commands')
export class CommandsController {
  constructor(private commandsService: CommandsService) {}

  // User sends command to a device
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':deviceId')
  send(
    @Request() req,
    @Param('deviceId') deviceId: string,
    @Body() dto: SendCommandDto,
  ) {
    return this.commandsService.send(req.user.id, deviceId, dto);
  }

  // User views command history for a device
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':deviceId')
  findAll(@Param('deviceId') deviceId: string) {
    return this.commandsService.findAll(deviceId);
  }

  // Device acknowledges a command
  @ApiBearerAuth()
  @UseGuards(DeviceAuthGuard)
  @Patch(':commandId/ack')
  acknowledge(
    @Request() req,
    @Param('commandId') commandId: string,
  ) {
    return this.commandsService.acknowledge(req.device.id, commandId);
  }
}