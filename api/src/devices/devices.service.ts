import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { SendCommandDto } from './dto/send-command.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class DevicesService {
    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cache: Cache,
    ) { }

    async create(userId: string, dto: CreateDeviceDto) {
        const device = await this.prisma.device.create({
            data: { ...dto, userId },
        });
        await this.cache.del(`devices:user:${userId}`); // invalidate list cache
        return device;
    }

    async findAll(userId: string) {
        const cacheKey = `devices:user:${userId}`;
        const cached = await this.cache.get(cacheKey);
        if (cached) return cached;

        const devices = await this.prisma.device.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        await this.cache.set(cacheKey, devices, 120000); // 2 min TTL
        return devices;
    }

    async findOne(userId: string, deviceId: string) {
        const cacheKey = `device:${deviceId}`;
        const cached = await this.cache.get(cacheKey);
        if (cached) return cached;

        const device = await this.prisma.device.findUnique({
            where: { id: deviceId },
            include: {
                telemetry: {
                    orderBy: { createdAt: 'desc' },
                    take: 1, // only latest telemetry
                },
                commands: {
                    orderBy: { sentAt: 'desc' },
                    take: 5,
                },
            },
        });

        if (!device) throw new NotFoundException('Device not found');
        if (device.userId !== userId) throw new ForbiddenException();

        await this.cache.set(cacheKey, device, 60000); // 1 min TTL
        return device;
    }

    async remove(userId: string, deviceId: string) {
        const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
        if (!device) throw new NotFoundException('Device not found');
        if (device.userId !== userId) throw new ForbiddenException();

        await this.prisma.device.delete({ where: { id: deviceId } });
        await this.cache.del(`device:${deviceId}`);
        await this.cache.del(`devices:user:${userId}`);

        return { message: 'Device deleted' };
    }

    async sendCommand(userId: string, deviceId: string, dto: SendCommandDto) {
        const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
        if (!device) throw new NotFoundException('Device not found');
        if (device.userId !== userId) throw new ForbiddenException();

        return this.prisma.command.create({
            data: { deviceId, instruction: dto.instruction },
        });
    }

    async acknowledgeCommand(deviceId: string, commandId: string) {
        const [device, command] = await this.prisma.$transaction([this.prisma.device.findUnique({ where: { id: deviceId } }), this.prisma.command.findUnique({ where: { id: commandId } })])

        if (!device) throw new NotFoundException('Device not found');

        if (!command) throw new NotFoundException('Command not found');

        return this.prisma.command.update({
            where: { id: commandId },
            data: { status: 'ACKNOWLEDGED', ackedAt: new Date() },
        });
    }
}