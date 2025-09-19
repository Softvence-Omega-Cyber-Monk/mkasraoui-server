import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import sendResponse from '../utils/sendResponse';
import { RequestProviderDto } from './dto/request-provider.dto';
import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { UpdateProviderDto } from './dto/update-provider.dto';

@ApiTags('Providers')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // User submits provider request
  @Post('request-provider')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Submit a request to become a provider' })
  @ApiBody({ type: RequestProviderDto })
  @ApiResponse({ status: 200, description: 'Provider request submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or user not allowed' })
  async requestProvider(@Req() req: Request, @Body() dto: RequestProviderDto, @Res() res: any) {
    const result = await this.userService.requestProvider(req.user!.id, dto);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Provider request submitted successfully',
      data: result,
    });
  }

  // Admin only: List all providers
  @Get('providers')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all providers with optional filter by approval status' })
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
  @ApiResponse({ status: 200, description: 'Provider request approved successfully' })
  @ApiResponse({ status: 404, description: 'Provider request not found' })
  async approveRequest(@Req() req: Request, @Param('id') id: string, @Res() res: any) {
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
  @ApiResponse({ status: 200, description: 'Provider request rejected successfully' })
  @ApiResponse({ status: 404, description: 'Provider request not found' })
  async rejectRequest(@Req() req: Request, @Param('id') id: string, @Res() res: any) {
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
@ApiOperation({ summary: 'Update your provider profile' })
@ApiBody({ type: UpdateProviderDto })
@ApiResponse({ status: 200, description: 'Provider profile updated successfully' })
@ApiResponse({ status: 404, description: 'Provider profile not found' })
@ApiResponse({ status: 400, description: 'Cannot update unapproved profile' })
async updateProviderProfile(@Req() req: Request, @Body() dto: UpdateProviderDto, @Res() res: any) {
  const result = await this.userService.updateProviderProfile(req.user!.id, dto);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Provider profile updated successfully',
    data: result,
  });
}
}
