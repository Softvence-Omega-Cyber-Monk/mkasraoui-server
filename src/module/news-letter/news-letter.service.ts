import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNewsLetterDto } from './dto/create-news-letter.dto';
import { UpdateNewsLetterDto } from './dto/update-news-letter.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NewsLetterService {
  constructor(private prisma: PrismaService) { }
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
  findAllNewsletter() {
    const data = this.prisma.newsLetter.findMany();
    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} newsLetter`;
  }

  update(id: number, updateNewsLetterDto: UpdateNewsLetterDto) {
    return `This action updates a #${id} newsLetter`;
  }

  remove(id: number) {
    return `This action removes a #${id} newsLetter`;
  }
}
