import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { ProviderReviewService } from './provider-review.service';
import { CreateProviderReviewDto } from './dto/create-provider-review.dto';
import { UpdateProviderReviewDto } from './dto/update-provider-review.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import sendResponse from 'src/module/utils/sendResponse';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/common/decorators/public.decorators';

@ApiTags('Provider Review')
@Controller('provider-review')
export class ProviderReviewController {
  constructor(private readonly providerReviewService: ProviderReviewService) {}

  @Post()
  @UseGuards(AuthGuard('jwt')) // Protects this route
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new provider review.' })
  @ApiResponse({ status: 201, description: 'Review created successfully.' })
  async create(
    @Body() createProviderReviewDto: CreateProviderReviewDto,
    @Res() res: Response,
    @Req() req:any
  ) {
    const userId = req.user.id;
    const data = await this.providerReviewService.create(createProviderReviewDto, userId);
    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Provider review created successfully',
      data: data,
    });
  }

  @Get()
  @Public() // This route is public for all users to see reviews
  @ApiOperation({ summary: 'Retrieve all provider reviews.' })
  async findAll(@Res() res: Response) {
    const data = await this.providerReviewService.findAll();
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Provider reviews retrieved successfully',
      data: data,
    });
  }

  @Get(':id')
  @Public() // This route is public for all users to see a specific review
  @ApiOperation({ summary: 'Retrieve a single provider review by ID.' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const data = await this.providerReviewService.findOne(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Provider review retrieved successfully',
      data: data,
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt')) // Protects this route
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a provider review by its ID.' })
  async update(
    @Param('id') id: string,
    @Body() updateProviderReviewDto: UpdateProviderReviewDto,
   @Req() req: any,
    @Res() res: Response,
  ) {
     const userId = req.user.id;
    const data = await this.providerReviewService.update(id, updateProviderReviewDto, userId);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Provider review updated successfully',
      data: data,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt')) // Protects this route
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a provider review by its ID.' })
  async remove(
    @Param('id') id: string,
    @Req() req:any,
    @Res() res: Response,
  ) {
     const userId = req.user.id;
    await this.providerReviewService.remove(id, userId);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Provider review deleted successfully',
      data: null,
    });
  }
}