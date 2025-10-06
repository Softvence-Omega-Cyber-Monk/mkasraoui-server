import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import sendResponse from '../utils/sendResponse';
import { Request, Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role, ServiceCategory } from '@prisma/client';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from 'src/common/decorators/public.decorators';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // User submits provider request
 @Post('request-provider')
  @Roles(Role.USER)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit a request to become a provider' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description: 'Provider data as JSON string',
          example: JSON.stringify({
            bussinessName: 'My Company',
            email: 'test@example.com',
            contactName: 'John Doe',
            phone: '1234567890',
            serviceCategory: [' PHOTOGRAPHY', 'FOOD_CATERING'],
            serviceArea: 'New York',
            latitude: 40.7128,
            longitude: -74.006,
            description: 'We provide high-quality services.',
            price: 100,
            website: 'https://example.com',
            instagram: 'https://instagram.com/example',
          }),
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Provider request submitted successfully',
  })
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
  async requestProvider(
  @Req() req: Request,
  @Body('data') data: string,
  @UploadedFiles() files: Array<Express.Multer.File>,
  @Res() res: any,
) {

  let dto:any
  try {
    dto = JSON.parse(data); // <-- wrap in try-catch
   
  } catch (err) {
    console.error('Error in requestProvider:', err);
  
  }
   const result = await this.userService.requestProvider(req.user!.id, dto, files);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Provider request submitted successfully',
      data: result,
    });
}



@Get('providers')
@Public()
@ApiOperation({ summary: 'Get all providers with search, filter & pagination' })
@ApiQuery({ name: 'isApproved', required: false, type: Boolean })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
@ApiQuery({ name: 'search', required: false, type: String, description: 'Search by business name or service area' })
@ApiQuery({ name: 'serviceCategory', required: false, enum: ServiceCategory})
@ApiQuery({ name: 'serviceArea', required: false, type: String })
@ApiQuery({ name: 'priceRange', required: false, type: String })
@ApiResponse({ status: 200, description: 'Providers fetched successfully' })
async getAllProviders(@Query() query: any, @Res() res: any) {
  const result = await this.userService.getAllProviders(query);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Providers fetched successfully',
    data: result,
  });
}

  // Admin only: Approve a provider request
  @Patch('provider-requests/:id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Approve a pending provider request' })
  @ApiResponse({
    status: 200,
    description: 'Provider request approved successfully',
  })
  @ApiResponse({ status: 404, description: 'Provider request not found' })
  async approveRequest(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    const result = await this.userService.approveProviderRequest(id);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Provider request approved',
      data: result,
    });
  }


/** GET SINGLE PROVIDER */
@Get('providers/meta-data')
@Roles(Role.PROVIDER)
@ApiOperation({ summary: 'Get  provider Metadata' })
@ApiResponse({ status: 200, description: 'Provider metadata fetched successfully' })
async  providerMetaData(@Req() req:Request ,@Res() res:Response) {
  const result = await this.userService.providerMetaData(req.user!.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Provider fetched successfully',
    data: result,
  });
}




/** GET SINGLE PROVIDER */
@Get('providers/:id')
@Public()
@ApiOperation({ summary: 'Get single provider details by ID' })
@ApiResponse({ status: 200, description: 'Provider fetched successfully' })
@ApiResponse({ status: 404, description: 'Provider not found' })
async getProviderById(@Param('id') id: string, @Res() res: any) {
  const result = await this.userService.getProviderById(id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Provider fetched successfully',
    data: result,
  });
}





  // Admin only: Reject a provider request
  @Delete('provider-requests/:id/reject')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reject a pending provider request' })
  @ApiResponse({
    status: 200,
    description: 'Provider request rejected successfully',
  })
  @ApiResponse({ status: 404, description: 'Provider request not found' })
  async rejectRequest(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    const result = await this.userService.rejectProviderRequest(id);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Provider request rejected',
      data: result,
    });
  }

@Post('provider/update-profile')
@Roles(Role.PROVIDER)
@ApiConsumes('multipart/form-data')
@ApiOperation({ summary: 'Update provider profile with full image control' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      data: {
        type: 'string',
        description: 'Provider profile data as JSON string',
        example: JSON.stringify({
          bussinessName: 'My Company',
          email: 'test@example.com',
          contactName: 'John Doe',
          phone: '1234567890',
          serviceCategory: ['PHOTOGRAPHY', 'FOOD_CATERING'],
          serviceArea: 'New York',
          latitude: 40.7128,
          longitude: -74.006,
          description: 'We provide high-quality services.',
          price: 200,
          website: 'https://example.com',
          instagram: 'https://instagram.com/example',
          removeImages: [
            'http://localhost:5000/uploads/files-1758262860926-193782177.jpg',
          ], 
        }),
      },
      files: {
        type: 'array',
        items: { type: 'string', format: 'binary' },
      },
    },
  },
})
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
@ApiResponse({ status: 200, description: 'Provider profile updated successfully' })
@ApiResponse({ status: 400, description: 'Cannot update unapproved profile' })
@ApiResponse({ status: 404, description: 'Provider profile not found' })
async updateProviderProfile(
  @Req() req: Request,
  @Body('data') data: string,
  @UploadedFiles() files: Array<Express.Multer.File>,
  @Res() res: any,
) {
  let dto: any;
  try {
    dto = JSON.parse(data);
  } catch (err) {
    throw new BadRequestException('Invalid JSON in data field');
  } 
  const result = await this.userService.updateProviderProfile(req.user!.id, dto, files);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Provider profile updated successfully',
    data: result,
  });
}


  @Get('me')
  @ApiOperation({ summary: 'Get currently authenticated user info' })
  @ApiResponse({ status: 200, description: 'Returns user info' })
  async getMe(@Req() req: any) {
    const user = await this.userService.getMe(req.user);

    return {
      statusCode: 200,
      success: true,
      message: 'Current user fetched successfully',
      data: user,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @Roles(Role.ADMIN)
  @ApiResponse({ status: 200, description: 'Returns list of users' })
  async getAllUsers() {
    const users = await this.userService.getAllUsers();
    return {
      statusCode: 200,
      success: true,
      message: 'Users fetched successfully',
      data: users,
    };
  }


  @Patch()
@ApiConsumes('multipart/form-data')
@ApiOperation({ summary: 'Update user details (name, phone, and optional profile image).' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'New user name.',
        example: 'Jane Doe',
      },
      phone: {
        type: 'string',
        description: 'New user phone number.',
        example: '+1234567890',
      },
      files: {
        type: 'array',
        maxItems: 1,
        items: {
          type: 'string',
          format: 'binary',
        },
        description: 'Optional new profile image file (up to 1).',
      },
    },
    required: [], 
  },
})
@ApiResponse({ status: 200, description: 'User updated successfully' })
@ApiResponse({ status: 400, description: 'Invalid input or file upload error.' })
@UseInterceptors(
  FilesInterceptor('files', 1, { 
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
async updateUser(
  @Req() req: any, 
  @Body() body: { name?: string; phone?: string },
  @UploadedFiles() files: Array<Express.Multer.File>,
) {
 try{
   const profileImageFile = files && files.length > 0 ? files[0] : null;
  const updateData = {
    ...body,
    profileImage: profileImageFile, 
  };
  const updatedUser = await this.userService.updateUser(req.user.id, updateData);
  
  return {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: updatedUser,
  };
}catch(err){
  throw new BadRequestException('Invalid input or file upload error.');
 }
}


/** GET SINGLE PROVIDER */
@Delete('delete-user/:id')
@Roles(Role.ADMIN)
@ApiOperation({ summary: 'Delete user by ID' })
async deleteUser(@Param('id') id: string, @Res() res: any) {
  const result = await this.userService.deleteUser(id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Provider delete successfully',
    data: result,
  });
}


}
