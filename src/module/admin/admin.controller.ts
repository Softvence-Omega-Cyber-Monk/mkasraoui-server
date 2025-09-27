import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';


@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
 async find_meta_data() {
    const res=await this.adminService.getDashboardStats();
    return{
      message:"Admin meta data fetched successfully",
      data:res
    }
  }

}
 