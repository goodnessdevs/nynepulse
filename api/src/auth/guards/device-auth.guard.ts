import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeviceAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing device token');
    }

    const token = authHeader.split(' ')[1];
    const device = await this.prisma.device.findUnique({ where: { token } });

    if (!device) throw new UnauthorizedException('Invalid device token');

    // Attach device to request so telemetry controller can access it
    request.device = device;
    return true;
  }
}