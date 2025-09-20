import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role, QuoteStatus } from '@prisma/client';
import { Request } from 'express';
import sendResponse from '../utils/sendResponse';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Quotes')
@Controller('quotes')
export class QuoteController {
  constructor(
    private quoteService: QuoteService,
    private prisma: PrismaService,
  ) {}

  // User sends a new quote
  @Post()
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Create a new quote request (User only)' })
  @ApiBody({ type: CreateQuoteDto })
  @ApiResponse({
    status: 201,
    description: 'Quote created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation or bad request error' })
  async createQuote(
    @Req() req: Request,
    @Body() dto: CreateQuoteDto,
    @Res() res: any,
  ) {
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
  @ApiOperation({
    summary: 'Update quote status (BOOKED or CANCELLED) (Provider only)',
  })
  @ApiParam({ name: 'id', description: 'Quote ID', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(QuoteStatus),
          example: QuoteStatus.BOOKED,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Quote status updated' })
  @ApiResponse({ status: 403, description: 'Forbidden: not your quote' })
  async updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('status') status: QuoteStatus,
    @Res() res: any,
  ) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { userId: req.user?.id },
    });
    if (!provider) {
      throw new BadRequestException("Provider doesn't exist!");
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
  @ApiOperation({ summary: 'Cancel a quote (User only)' })
  @ApiParam({ name: 'id', description: 'Quote ID', type: String })
  @ApiResponse({ status: 200, description: 'Quote cancelled successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel a booked quote',
  })
  async cancelQuote(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: any,
  ) {
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
@ApiOperation({ summary: 'Get logged-in user quote history (paginated)' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
@ApiResponse({ status: 200, description: 'User quotes fetched successfully' })
async myQuotes(
  @Req() req: Request,
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Res() res: any,
) {
  const result = await this.quoteService.getUserQuotes(
    req.user!.id,
    Number(page),
    Number(limit),
  );
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
@ApiOperation({ summary: 'Get logged-in provider quote history (paginated)' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
@ApiResponse({
  status: 200,
  description: 'Provider quotes fetched successfully',
})
async providerQuotes(
  @Req() req: Request,
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Res() res: any,
) {
  const provider = await this.prisma.providerProfile.findUnique({
    where: { userId: req.user?.id },
  });
  if (!provider) {
    throw new BadRequestException("Provider doesn't exist!");
  }
  const result = await this.quoteService.getProviderQuotes(
    provider.id,
    Number(page),
    Number(limit),
  );
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Provider quotes fetched successfully',
    data: result,
  });
}
}
