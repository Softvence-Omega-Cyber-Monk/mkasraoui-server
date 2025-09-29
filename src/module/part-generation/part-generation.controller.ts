// part-generation/part-generation.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { PartGenerationService } from './part-generation.service';
import { CreatePartGenerationDto } from './dto/create-part-generation.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('part-generation (Party Plans)')
@Controller('part-generation')
export class PartGenerationController {
  constructor(private readonly partGenerationService: PartGenerationService) {}
  
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new Party Plan (Part Generation)' })
  @ApiResponse({ status: 201, description: 'The Party Plan has been successfully created.' })
  @ApiBody({ type: CreatePartGenerationDto })
  create(@Body() createPartGenerationDto: CreatePartGenerationDto, @Req() req: any) {
    const userId=req.user?.id;
    return this.partGenerationService.create(createPartGenerationDto,userId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all Party Plans' })
  @ApiResponse({ status: 200, description: 'Return all Party Plans.' })
  findAll(@Req() req: any) {
    const userId=req.user?.id;
    return this.partGenerationService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single Party Plan by ID' })
  @ApiResponse({ status: 200, description: 'Return a single Party Plan.' })
  @ApiResponse({ status: 404, description: 'Party Plan not found.' })
  findOne(@Param('id') id: string) {
    return this.partGenerationService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a Party Plan by ID' })
  @ApiResponse({ status: 204, description: 'The Party Plan has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Party Plan not found.' })
  remove(@Param('id') id: string) {
    return this.partGenerationService.remove(id);
  }
}