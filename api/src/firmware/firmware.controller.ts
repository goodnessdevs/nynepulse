import {
  Controller, Post, Get, Delete,
  Param, Body, Query,
  UseGuards, UseInterceptors,
  UploadedFile, Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FirmwareService } from './firmware.service';
import { UploadFirmwareDto } from './dto/upload-firmware.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DeviceAuthGuard } from '../auth/guards/device-auth.guard';

@ApiTags('Firmware')
@Controller('firmware')
export class FirmwareController {
  constructor(private firmwareService: FirmwareService) {}

  // Admin uploads firmware
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        version: { type: 'string' },
        deviceType: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: process.env.UPLOAD_PATH || './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `firmware-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      // Only allow .bin and .hex firmware files
      const allowed = ['.bin', '.hex', '.elf'];
      const ext = extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only .bin, .hex, .elf files are allowed'), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  }))
  upload(@Body() dto: UploadFirmwareDto, @UploadedFile() file: Express.Multer.File) {
    return this.firmwareService.upload(dto, file);
  }

  // Admin views all firmware
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.firmwareService.findAll();
  }

  // Device polls for latest firmware by type
  @ApiBearerAuth()
  @UseGuards(DeviceAuthGuard)
  @Get('latest')
  getLatest(@Query('deviceType') deviceType: string) {
    return this.firmwareService.getLatest(deviceType);
  }

  // Admin deletes firmware
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.firmwareService.remove(id);
  }
}