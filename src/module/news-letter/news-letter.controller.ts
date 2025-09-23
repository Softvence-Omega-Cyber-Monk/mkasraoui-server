import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express'; // Import Response from 'express'
import { NewsLetterService } from './news-letter.service';
import { CreateNewsLetterDto } from './dto/create-news-letter.dto';
import { UpdateNewsLetterDto } from './dto/update-news-letter.dto';
import { ApiBody } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorators';
import sendResponse from '../utils/sendResponse';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';


@Controller('news-letter')
export class NewsLetterController {
  constructor(private readonly newsLetterService: NewsLetterService) { }

  @Post()
  @Public()
  @ApiBody({ type: CreateNewsLetterDto })
  async createNewsLetter(@Body() createNewsLetterDto: CreateNewsLetterDto, @Res() res: Response) {
   try{
 const data = await this.newsLetterService.createNewsletter(createNewsLetterDto);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'subscribed successfully',
      data,
    });
   }catch(error){
    sendResponse(res, {
      statusCode: HttpStatus.BAD_REQUEST,
      success: false,
      message: error.message,
      data: null,
    });
   }
  }

  @Get()
  @Roles(Role.ADMIN)
  async getAllNewsletters(@Res() res: Response) {
    try {
      const data = await this.newsLetterService.findAllNewsletter();
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Newsletters fetched successfully',
        data,
      });
    } catch (error) {
      sendResponse(res, {
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  @Get(':id')
  async getNewsletterById(@Param('id') id: string, @Res() res: Response) {
   try{
    const data = await this.newsLetterService.findOne(+id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Newsletter fetched successfully',
      data,
    });
   }catch(error){
    sendResponse(res, {
      statusCode: HttpStatus.BAD_REQUEST,
      success: false,
      message: error.message,
      data: null,
    });
   }
  }


  @Delete(':id')
  async deleteNewsletter(@Param('id') id: string, @Res() res: Response) {
   try{
    const data = await this.newsLetterService.remove(+id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Newsletter deleted successfully',
      data,
    });
   }catch(error){
    sendResponse(res, {
      statusCode: HttpStatus.BAD_REQUEST,
      success: false,
      message: error.message,
      data: null,
    });
   }
  }
}