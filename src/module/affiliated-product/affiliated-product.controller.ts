import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  HttpStatus,
  Res,
  Req,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateAffiliatedProductDto } from './dto/create-affiliated-product.dto';
import { UpdateAffiliatedProductDto } from './dto/update-affiliated-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import sendResponse from 'src/module/utils/sendResponse';
import { AffiliatedProductService } from './affiliated-product.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Public } from 'src/common/decorators/public.decorators';

@ApiTags('AffiliatedProduct')
@Controller('affiliate-product')
export class AffiliatedProductController {
  constructor(private readonly service: AffiliatedProductService) {}


  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new affiliated product (admin only).' })
  @ApiBody({ type: CreateAffiliatedProductDto })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  async create(@Body() dto: CreateAffiliatedProductDto, @Req() req: any, @Res() res: Response) {
    const data = await this.service.create(dto);
    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Affiliated product created successfully',
      data,
    });
  }

@Get()
@Public()
@ApiOperation({ summary: 'Get list of affiliated products (paginated & searchable)' })
@ApiQuery({
  name: 'page',
  required: false,
  example: 1,
  description: 'Page number (default: 1)'
})
@ApiQuery({
  name: 'limit',
  required: false,
  example: 10,
  description: 'Items per page (default: 10)'
})
@ApiQuery({
  name: 'search',
  required: false,
  example: 'headphones',
  description: 'Search in title or affiliated company (optional)'
})
@ApiQuery({
  name: 'company',
  required: false,
  example: 'Amazon',
  description: 'Filter by affiliated company (optional)'
})
@ApiResponse({ status: 200, description: 'List returned successfully.' })
async findAll(
  @Res() res: Response,
  @Query('page') page = 1,
  @Query('limit') limit = 10,
  @Query('search') search?: string,
  @Query('company') company?: string,
) {
  const data = await this.service.findAll({ page, limit, search, company });

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Products retrieved successfully',
    data,
  });
}



  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get one affiliated product by ID.' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const data = await this.service.findOne(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Product retrieved successfully',
      data,
    });
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update an affiliated product (admin only).' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAffiliatedProductDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const data = await this.service.update(id, dto);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Product updated successfully',
      data,
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an affiliated product (admin only).' })
  async remove(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    await this.service.remove(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Product deleted successfully',
      data: null,
    });
  }
}
