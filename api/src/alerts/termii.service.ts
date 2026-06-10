import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TermiiService {
  async sendSms(phone: string, message: string) {
    try {
      // await axios.post('https://api.ng.termii.com/api/sms/send', {
      await axios.post('https://v3.api.termii.com/api/sms/send', {
        to: phone,
        from: process.env.TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: process.env.TERMII_API_KEY,
      });
      console.log(`📱 SMS sent to ${phone}`);
    } catch (err) {
      // Don't crash the app if SMS fails
      console.error('SMS failed:', err.message);
    }
  }
}