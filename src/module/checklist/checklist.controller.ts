import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException } from '@nestjs/common';

import { Request } from 'express';
import { TasksService } from './checklist.service';
import { CreateTaskDto } from './dto/create-checklist.dto';
import { UpdateTaskDto } from './dto/update-checklist.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req: Request) {

    try{
      const userId = req.user?.id; 
    if (!userId) throw new Error('User not authenticated');
    const res=await this.tasksService.create(userId, createTaskDto);
    return{
      message: 'Task created successfully',
      data: res
    }
    }catch(error){
      throw new HttpException(error.message, 500);
    }
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new Error('User not authenticated');
    return this.tasksService.findAll(userId);
  }
  
  @Get('by-category')
  findTasksByCategory(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new Error('User not authenticated');
    return this.tasksService.findTasksByCategory(userId);
  }

  @Get('timeline')
  findTasksTimeline(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new Error('User not authenticated');
    return this.tasksService.findTasksTimeline(userId);
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}