import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
    private resend = new Resend(process.env.RESEND_API_KEY!);

    async sendEmail(to: string, subject: string, message: string) {
        try {
            await this.resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL!,
                to,
                subject,
                html: `<div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #e53e3e;">⚠️ NynePulse Alert</h2>
            <p style="font-size: 16px;">${message}</p>
            <hr />
            <small style="color: #999;">NynePulse IoT Management</small>
          </div>
        `,
            });
            console.log(`📧 Email alert sent to ${to}`);
        } catch (err) {
            console.error('Email failed:', err.message);
        }
    }
}