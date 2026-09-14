import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
}

@Injectable()
export class EmailService {

    private transposter: nodemailer.Transporter;

    constructor(
        @InjectPinoLogger(EmailService.name) private readonly logger: PinoLogger,
        private readonly configService: ConfigService,
    ) {
        this.createTransporter();

    }

    private createTransporter() {
        this.transposter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            }
        });

        void this.verifyConnection();
    }

    private async verifyConnection() {
        try {
            await this.transposter.verify;
            this.logger.info({
                msg: 'email.smtp.connected'
            });
        } catch (error) {
            this.logger.error({
                msg: 'email.smtp.connectionFailed',
                error: (error as Error).message,
            })
        }
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            const mailOptions = {
                from: options.from || this.configService.get<string>('SMTP_FROM'),
                to: Array.isArray(options.to)
                    ? options.to.join(', ') : options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            };

            const info = await this.transposter.sendMail(mailOptions) as unknown as { messageId: string };
            this.logger.info(
                {
                    msg: 'email.sent',
                    messageId: info.messageId,
                    subject: options.subject,
                });
            return true;
        } catch (error) {
            this.logger.error({
                msg: 'email.sendFailed',
                subject: options.subject,
                error: (error as Error).message
            });
            return false;
        }
    }

}
