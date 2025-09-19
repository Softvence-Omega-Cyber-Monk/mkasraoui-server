import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role, QuoteStatus } from '@prisma/client';
import { Request } from 'express';
import sendResponse from '../utils/sendResponse';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('quotes')
export class QuoteController {
  constructor(private quoteService: QuoteService,
    private prisma: PrismaService
  ) {}

  // User sends a new quote
  @Post()
  @Roles(Role.USER)
  async createQuote(@Req() req: Request, @Body() dto: any, @Res() res: any) {
    const result = await this.quoteService.createQuote(req.user!.id, dto);
    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Quote request submitted',
      data: result,
    });
  }

  // Provider updates status
  @Patch(':id/status')
  @Roles(Role.PROVIDER)
  async updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('status') status: QuoteStatus,
    @Res() res: any,
  ) {
    const provider= await this.prisma.providerProfile.findUnique({
      where:{userId:req.user?.id}
    })
    if(!provider){
      throw new BadRequestException("Provider doesn't exist!")
    }
    const result = await this.quoteService.updateQuoteStatus(
      provider.id,
      id,
      status,
    );
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Quote ${status.toLowerCase()} successfully`,
      data: result,
    });
  }

  // User cancels their quote
  @Patch(':id/cancel')
  @Roles(Role.USER)
  async cancelQuote(@Req() req: Request, @Param('id') id: string, @Res() res: any) {
    const result = await this.quoteService.cancelQuote(req.user!.id, id);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Quote cancelled successfully',
      data: result,
    });
  }

  // User’s history
  @Get('my')
  @Roles(Role.USER)
  async myQuotes(@Req() req: Request, @Res() res: any) {
    const result = await this.quoteService.getUserQuotes(req.user!.id);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User quotes fetched successfully',
      data: result,
    });
  }

  // Provider’s history
  @Get('provider/my')
  @Roles(Role.PROVIDER)
  async providerQuotes(@Req() req: Request, @Res() res: any) {
    const provider= await this.prisma.providerProfile.findUnique({
      where:{userId:req.user?.id}
    })
    if(!provider){
      throw new BadRequestException("Provider doesn't exist!")
    }
    const result = await this.quoteService.getProviderQuotes(
     provider.id
    );
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Provider quotes fetched successfully',
      data: result,
    });
  }
}
