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
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import sendResponse from 'src/module/utils/sendResponse';


import { Public } from 'src/common/decorators/public.decorators';

@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()

  @ApiOperation({ summary: 'Create a new product review.' })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({ status: 201, description: 'Review created successfully.' })
  async create(
    @Body() createReviewDto: CreateReviewDto,
     @Req() req:any,
    @Res() res: Response,
  ) {
    const userId=req.user.id
    const data = await this.reviewService.create(createReviewDto, userId);
    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Review created successfully',
      data: data,
    });
  }

  // @Get()
  // @Public()
  // @ApiOperation({ summary: 'Retrieve all product reviews.' })
  // async findAll(@Res() res: Response) {
  //   const data = await this.reviewService.findAll();
  //   return sendResponse(res, {
  //     statusCode: HttpStatus.OK,
  //     success: true,
  //     message: 'Reviews retrieved successfully',
  //     data: data,
  //   });
  // }

  // @Get(':id')
  // @Public()
  // @ApiOperation({ summary: 'Retrieve a single review by ID.' })
  // async findOne(@Param('id') id: string, @Res() res: Response) {
  //   const data = await this.reviewService.findOne(id);
  //   return sendResponse(res, {
  //     statusCode: HttpStatus.OK,
  //     success: true,
  //     message: 'Review retrieved successfully',
  //     data: data,
  //   });
  // }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a review by its ID.' })
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Res() res: Response,
    @Req() req:any
  ) {
    const userId=req.user.id
    const data = await this.reviewService.update(id, updateReviewDto, userId);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Review updated successfully',
      data: data,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review by its ID.' })
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
     @Req() req:any
  ) {
    const userId=req.user.id
    await this.reviewService.remove(id, userId);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Review deleted successfully',
      data: null,
    });
  }
}