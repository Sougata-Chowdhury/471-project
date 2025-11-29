import { Injectable } from '@nestjs/common';
import { MailService } from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailClient {
  private mailService: MailService;

  constructor(private configService: ConfigService) {
    this.mailService = new MailService();
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY') || '';
    this.mailService.setApiKey(apiKey);
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    const msg = {
      to,
      from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@bracunet.com',
      subject,
      text,
      html: html || text,
    };

    try {
      await this.mailService.send(msg);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Email could not be sent');
    }
  }
}