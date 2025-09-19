import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from 'src/common/decorators/public.decorators';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import sendResponse from 'src/module/utils/sendResponse';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new product with activities and images.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description: 'The product data as a JSON string, including activities.',
          example: JSON.stringify({
            title: 'Building Blocks',
            description: 'A set of colorful blocks...',
            product_type: 'Toy',
            included: ['50 pieces', 'manual'],
            activities: [
              { title: 'Build a Tower', description: 'Use the blocks...' },
              { title: 'Build a Bridge', description: 'Create a bridge...' },
            ],
          }),
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The product and its activities have been successfully created.' })
  @UseInterceptors(
    FilesInterceptor('files', 10, { 
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async createProduct(
    @Body('data') data: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    try {
      const productData: CreateProductDTO = JSON.parse(data);
      console.log('Product Data:', productData);
      console.log('Uploaded Files:', files);
      
      return  this.productsService.create(productData, files);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  @Get()
  @Public()
  async findAll(@Res() res: Response) {
    const data=await this.productsService.findAll();
     return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Data retrive success',
      data: data,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body('data') data: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    try {
      const updateProductDto: UpdateProductDto = JSON.parse(data);
      return this.productsService.update(id, updateProductDto, files);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}