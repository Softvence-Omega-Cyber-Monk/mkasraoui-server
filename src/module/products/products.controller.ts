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
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDTO, CreateProductMultipartDto, ProductFilterDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
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
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CreateDiyActivityMultipartDto } from './dto/createDiyActivity.dto';
import { ActivityQuery } from './dto/activityQuery.dto';
import { UpdateActivityMultipartDto } from './dto/updatedActivity.dto';
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


  // ---------------------------------------------------------------------activity----------------------------------------------------
@Patch('update-activity/:id')
@Public()
@UseInterceptors(
  FileInterceptor('video', {
    ...fileStorageOptions,
    limits: { fileSize: 10 * 1024 * 1024 } 
  })
)
@ApiOperation({ summary: 'update a new DIY activity with an optional video upload' })
@ApiConsumes('multipart/form-data') 
@ApiBody({
  description: 'Updated data for the DIY activity, including an optional replacement video file.',
  type: UpdateActivityMultipartDto,
})
async update_activity(
  @Body() body: any,
  @UploadedFile() videoFile: Express.Multer.File,
  @Param('id') id:string
) {
  try {
    const res=await this.productsService.update_activity(body, videoFile,id);
    return {
      message:"Activity updated successfull",
      data:res
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}


  @Public()
@Get("activity")
async getAll(@Query()filterDto:ActivityQuery){
  return this.productsService.get_all_activity(filterDto)
}




@Delete('delet-activity/:id')
@Public()
async deleteActivity(@Param('id') id:string){
  const res=await this.productsService.delete_activity(id)
  return{
    message:"Activity delete successfull",
    data:res
  }
}




  // --------------------------------------------------------------------------
  //                 CREATE PRODUCT ROUTE (UPDATED)
  // --------------------------------------------------------------------------
 @Post()
@ApiConsumes('multipart/form-data')
@ApiOperation({ summary: 'Create a new product with activities, images, and an optional tutorial video.' })
@ApiBody({
  type: CreateProductMultipartDto, 
  description: 'Product creation data, including files and a JSON payload for the "data" field.',
})
@ApiResponse({
    status: 201,
    description: 'The product and its activities have been successfully created.',
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

  let productData: CreateProductDTO;
  
  try {
    const parsedJson = JSON.parse(data);
    productData = plainToInstance(CreateProductDTO, parsedJson);
    await validateOrReject(productData);
    
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
    // ... (error handling remains the same)
    console.error('Error creating product:', err);

    if (Array.isArray(err) && err.length > 0) {
      throw new HttpException(
        `Validation failed: ${err.map(e => Object.values(e.constraints)).join('; ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (err instanceof SyntaxError) {
      throw new HttpException('Invalid JSON data format', HttpStatus.BAD_REQUEST);
    }
    
    if (err instanceof HttpException) {
        throw err;
    }
    
    throw new HttpException(
      'Failed to create product due to an internal error.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }}

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
        message: err.message || 'Failed to retrieve data',
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
        message: err.message || 'Failed to delete product',
        data: null,
      });
    }
  }




@Post('create-activity')
@Public()
@UseInterceptors(
  FileInterceptor('video', {
    ...fileStorageOptions,
    limits: { fileSize: 10 * 1024 * 1024 } 
  })
)
@ApiOperation({ summary: 'Create a new DIY activity with an optional video upload' })
@ApiConsumes('multipart/form-data') 
@ApiBody({
  description: 'Data for the new DIY activity, including an optional video file.',
  type: 'multipart/form-data' as any,
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', nullable: true },
      description: { type: 'string', nullable: true },
      instruction_sheet: { type: 'string', nullable: true },
      video: {
        type: 'string',
        format: 'binary',
        description: 'The video file for the DIY activity (max 10MB).'
      },
    },
    required: ['title'] 
  },
})
async create_activity(
  @Body() body: any,
  @UploadedFile() videoFile: Express.Multer.File,
) {
  try {
    let savedFilePath: string | null = null;
    if (videoFile) {
      savedFilePath = `/uploads/${videoFile.filename}`; 
      body.video = savedFilePath;
    }
    const res=await this.productsService.create_activity(body, videoFile);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
}






}