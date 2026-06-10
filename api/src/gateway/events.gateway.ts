import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // Dashboard joins to receive all its devices' telemetry
  @SubscribeMessage('join:dashboard')
  handleDashboardJoin(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    client.join(`user:${userId}`);
    client.emit('joined', { room: `user:${userId}` });
  }

  // Device joins to receive commands
  @SubscribeMessage('join:device')
  handleDeviceJoin(@ConnectedSocket() client: Socket, @MessageBody() deviceId: string) {
    client.join(`device:${deviceId}`);
    client.emit('joined', { room: `device:${deviceId}` });
  }

  // Called by TelemetryService when a device publishes data
  emitTelemetry(userId: string, deviceId: string, payload: any) {
    console.log(`📡 Emitting telemetry to room user:${userId}`);
    this.server.to(`user:${userId}`).emit('telemetry', { deviceId, payload });
  }

  // Called by CommandsService when a command is sent
  emitCommand(deviceId: string, command: any) {
    this.server.to(`device:${deviceId}`).emit('command', command);
  }

  // Called when device status changes
  emitDeviceStatus(userId: string, deviceId: string, status: string) {
    this.server.to(`user:${userId}`).emit('device:status', { deviceId, status });
  }
}