import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure:true, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendMail(options: {
        to: string | string[];
        subject: string;
        html: string;
        from?: string;
        attachments?: nodemailer.Attachment[]; // 👈 RE-ADDED for image embedding
    }) {
        // Destructure attachments again
        const { to, subject, html, from, attachments } = options;
        const senderAddress = from || `MA FATE FACILE <${process.env.EMAIL_USER}>`;

        try {
            const info = await this.transporter.sendMail({
                from: senderAddress, 
                to,
                subject,
                html,
                attachments, // 👈 Included in the send call
            });
            console.log('Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}