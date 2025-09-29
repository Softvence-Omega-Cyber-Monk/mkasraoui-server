import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';


@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @Roles(Role.ADMIN)
 async find_meta_data() {
    const res=await this.adminService.getDashboardStats();
    return{
      message:"Admin meta data fetched successfully",
      data:res
    }
  }

}
 