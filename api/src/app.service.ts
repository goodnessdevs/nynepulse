import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health(): string {
    const time = new Date().toLocaleTimeString()
    return `All is good man - ${time}`;
  }
}
