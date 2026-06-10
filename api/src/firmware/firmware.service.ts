import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadFirmwareDto } from './dto/upload-firmware.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirmwareService {
  constructor(private prisma: PrismaService) {}

  async upload(dto: UploadFirmwareDto, file: Express.Multer.File) {
    const fileUrl = `/uploads/${file.filename}`;

    const firmware = await this.prisma.firmware.create({
      data: {
        version: dto.version,
        deviceType: dto.deviceType,
        fileUrl,
      },
    });

    return firmware;
  }

  // Device calls this to check if a newer firmware exists
  async getLatest(deviceType: string) {
    const firmware = await this.prisma.firmware.findFirst({
      where: { deviceType },
      orderBy: { uploadedAt: 'desc' },
    });

    if (!firmware) throw new NotFoundException('No firmware found for this device type');
    return firmware;
  }

  async findAll() {
    return this.prisma.firmware.findMany({
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async remove(id: string) {
    const firmware = await this.prisma.firmware.findUnique({ where: { id } });
    if (!firmware) throw new NotFoundException('Firmware not found');

    // Delete file from disk
    const filePath = path.join(process.cwd(), firmware.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await this.prisma.firmware.delete({ where: { id } });
    return { message: 'Firmware deleted' };
  }
}