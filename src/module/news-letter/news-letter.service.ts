import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateNewsLetterDto } from './dto/create-news-letter.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PromotionalMailTemplatesService } from '../mail/promotinal_mail';

@Injectable()
export class NewsLetterService {
    private readonly logger = new Logger(NewsLetterService.name)
  constructor(private prisma: PrismaService, private mailService: MailService,private promotion:PromotionalMailTemplatesService) { }
  async createNewsletter(createNewsLetterDto: CreateNewsLetterDto) {
    const isExistEmail = await this.prisma.newsLetter.findFirst({
      where: {
        email: createNewsLetterDto.email,
      },
    });

    if (isExistEmail) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.newsLetter.create({
      data: {
        email: createNewsLetterDto.email,
      },
    });
  }


  async findAllNewsletter() {
    const data = await this.prisma.newsLetter.findMany();
    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} newsLetter`;
  }


  remove(id: number) {
    return `This action removes a #${id} newsLetter`;
  }

  async sendPromotionalMail(subject: string, message: string) {
    try {
      // 1. Fetch all newsletter subscribers from the database
      const subscribers = await this.prisma.newsLetter.findMany({
        select: {
          email: true,
        },
      });

      const recipientEmails = subscribers.map((subscriber) => subscriber.email);
      if (recipientEmails.length === 0) {
        this.logger.warn('No subscribers found. Promotional email was not sent.');
        return { message: 'No subscribers found.' };
      }
      const html=await this.promotion.getInvitationTemplate(subject, message)
      await this.mailService.sendMail({
        to: recipientEmails,
        subject,
        html,
      });

      this.logger.log(`Promotional email sent to ${recipientEmails.length} subscribers.`);
      return { message: 'Promotional email sent successfully.' };

    } catch (error) {
      this.logger.error(`Failed to send promotional email: ${error.message}`, error.stack);
      throw new HttpException('Failed to send promotional email.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
