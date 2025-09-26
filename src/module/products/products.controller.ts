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
  HttpException,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDTO, ProductFilterDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  FileFieldsInterceptor, // CHANGED: Imported FileFieldsInterceptor
} from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from 'src/common/decorators/public.decorators';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import sendResponse from 'src/module/utils/sendResponse';
const fileStorageOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
};

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // --------------------------------------------------------------------------
  //                 CREATE PRODUCT ROUTE (UPDATED)
  // --------------------------------------------------------------------------
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new product with activities, images, and an optional tutorial video.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description:
            'The product data as a JSON string, including activities.',
          example: JSON.stringify({
            title: 'Building Blocks',
            description: 'A set of colorful blocks...',
            product_type: 'DIY_BOX',
            theme: 'SUPERHERO',
            age_range: '3-6 years',
            price: 25.99,
            included: ['50 pieces', 'instruction manual'],
            tutorial: 'tutorial_video_reference',
            activities: [
              { title: 'Build a Tower', description: 'Use the blocks to build a tall tower.' },
              { title: 'Build a Bridge', description: 'Create a stable bridge using blocks.' },
            ],
          }),
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'The image files for the product (up to 10).',
        },
        tutorialVideo: {
          type: 'string',
          format: 'binary',
          description: 'The tutorial video file for the product.',
        },
      },
      required: ['data', 'files'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The product and its activities have been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or file upload error.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'An unexpected error occurred.',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'files', maxCount: 10 },       
        { name: 'tutorialVideo', maxCount: 1 },
      ],
      fileStorageOptions,
    ),
  )
  async createProduct(
    @Body('data') data: string,
    @UploadedFiles() uploadedFiles: {
      files?: Array<Express.Multer.File>;
      tutorialVideo?: Array<Express.Multer.File>;
    },
  ) {
    const imageFiles = uploadedFiles.files || [];
    const tutorialVideoFile = uploadedFiles.tutorialVideo
      ? uploadedFiles.tutorialVideo[0]
      : null;

    if (imageFiles.length === 0) {
      throw new HttpException('No product image files uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const productData: CreateProductDTO = JSON.parse(data);
      const createdProduct = await this.productsService.create(
        productData,
        imageFiles,
        tutorialVideoFile,
      );
      
      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: 'Product created successfully',
        data: createdProduct,
      };
    } catch (err) {
      console.error('Error creating product:', err);
      if (err instanceof SyntaxError) {
        throw new HttpException('Invalid JSON data', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Failed to create product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // --------------------------------------------------------------------------
  //               GET ALL PRODUCTS ROUTE (NO CHANGE)
  // --------------------------------------------------------------------------
  @Get()
  @Public()
  @ApiOperation({ summary: 'Retrieve all DIY boxes and Gifts with optional search and filters.' })
  @ApiResponse({ status: 200, description: 'Data retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to retrieve data.' })
  async findAll(
    @Query() filterDto: ProductFilterDto,
    @Res() res: Response
  ) {
    try {
      const data = await this.productsService.findAll(filterDto);

      return sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Data retrieved successfully',
        data: data,
      });
    } catch (err) {
      console.error(err);
      return sendResponse(res, {
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: 'Failed to retrieve data',
        data: null,
      });
    }
  }

  // --------------------------------------------------------------------------
  //                    GET PRODUCT BY ID ROUTE (NO CHANGE)
  // --------------------------------------------------------------------------
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.productsService.findOne(id);
      return sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Data retrieved successfully',
        data: data,
      });
    } catch (err) {
      return sendResponse(res, {
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: 'Failed to retrieve data',
        data: null,
      });
    }
  }

  // --------------------------------------------------------------------------
  //                      UPDATE PRODUCT ROUTE (UPDATED)
  // --------------------------------------------------------------------------
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing product and its files.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: { type: 'string', description: 'The product data as a JSON string.' },
        files: { 
            type: 'array', 
            items: { type: 'string', format: 'binary' },
            description: 'New product image files to replace/add to existing ones.',
        },
        tutorialVideo: {
            type: 'string',
            format: 'binary',
            description: 'New tutorial video file to replace the existing one.',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'files', maxCount: 10 },
        { name: 'tutorialVideo', maxCount: 1 },
      ],
      fileStorageOptions,
    ),
  )
  async update(
    @Param('id') id: string,
    @Body('data') data: string,
    @UploadedFiles() uploadedFiles: {
        files?: Array<Express.Multer.File>;
        tutorialVideo?: Array<Express.Multer.File>;
    },
    @Res() res: Response,
  ) {
    const imageFiles = uploadedFiles.files || [];
    const tutorialVideoFile = uploadedFiles.tutorialVideo
        ? uploadedFiles.tutorialVideo[0]
        : null;
        
    try {
      const updateProductDto: UpdateProductDto = JSON.parse(data);
      const updatedProduct = await this.productsService.update(
          id, 
          updateProductDto, 
          imageFiles,
          tutorialVideoFile,
      );
      
      return sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      });
    } catch (err) {
      return sendResponse(res, {
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: 'Failed to update product',
        data: null,
      });
    }
  }

  // --------------------------------------------------------------------------
  //                   DELETE PRODUCT ROUTE (NO CHANGE)
  // --------------------------------------------------------------------------
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const removedProduct = await this.productsService.remove(id);
      return sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Product deleted successfully',
        data: removedProduct,
      });
    } catch (err) {
      return sendResponse(res, {
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: 'Failed to delete product',
        data: null,
      });
    }
  }
}