import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../gateway/events.gateway';
import { SendCommandDto } from '../devices/dto/send-command.dto';

@Injectable()
export class CommandsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async send(userId: string, deviceId: string, dto: SendCommandDto) {
    // Verify device belongs to user
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) throw new NotFoundException('Device not found');
    if (device.userId !== userId) throw new ForbiddenException();

    // Save command
    const command = await this.prisma.command.create({
      data: { deviceId, instruction: dto.instruction },
    });

    // Push to device via WebSocket
    this.eventsGateway.emitCommand(deviceId, command);

    return command;
  }

  async acknowledge(deviceId: string, commandId: string) {
    const command = await this.prisma.command.findUnique({ where: { id: commandId } });
    if (!command) throw new NotFoundException('Command not found');
    if (command.deviceId !== deviceId) throw new ForbiddenException();

    return this.prisma.command.update({
      where: { id: commandId },
      data: { status: 'ACKNOWLEDGED', ackedAt: new Date() },
    });
  }

  async findAll(deviceId: string) {
    return this.prisma.command.findMany({
      where: { deviceId },
      orderBy: { sentAt: 'desc' },
      take: 20,
    });
  }
}