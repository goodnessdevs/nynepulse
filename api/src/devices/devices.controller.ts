import { Controller, Get, Post, Delete, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { SendCommandDto } from './dto/send-command.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) { }

  @Post()
  create(@Request() req, @Body() dto: CreateDeviceDto) {
    return this.devicesService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.devicesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.devicesService.findOne(req.user.id, id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.devicesService.remove(req.user.id, id);
  }

  @Post(':id/commands')
  sendCommand(@Request() req, @Param('id') id: string, @Body() dto: SendCommandDto) {
    return this.devicesService.sendCommand(req.user.id, id, dto);
  }

  @Patch(':id/ack/:commandId')
  acknowledgeCommand(@Param('id') id: string, @Param('commandId') commandId: string) {
    return this.devicesService.acknowledgeCommand(id, commandId);
  }
}