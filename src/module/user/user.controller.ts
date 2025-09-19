import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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
import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
            priceRange: '$100-$500',
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

  // Admin only: List all providers
  @Get('providers')
  @ApiOperation({
    summary: 'Get all providers with optional filter by approval status',
  })
  @ApiQuery({
    name: 'isApproved',
    required: false,
    description: 'Filter providers by approval status (true or false)',
    type: Boolean,
  })
  @ApiResponse({ status: 200, description: 'Providers fetched successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getAllProviders(
    @Query('isApproved') isApproved: string,
    @Res() res: any,
  ) {
    const filter = isApproved !== undefined ? isApproved === 'true' : undefined;
    const result = await this.userService.getAllProviders(filter);
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
          priceRange: '$100-$500',
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
}
