import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProviderPlanService } from './provider-plan.service';
import { CreateProviderPlanDto } from './dto/create-provider-plan.dto';
import { UpdateProviderPlanDto } from './dto/update-provider-plan.dto';
import { ApiBody } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('provider-plan')
export class ProviderPlanController {
  constructor(private readonly providerPlanService: ProviderPlanService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiBody({ type: CreateProviderPlanDto })
  create(@Body() createProviderPlanDto: CreateProviderPlanDto) {
    return this.providerPlanService.create(createProviderPlanDto);
  }

  @Get()
  findAll() {
    return this.providerPlanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providerPlanService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProviderPlanDto: UpdateProviderPlanDto) {
    return this.providerPlanService.update(id, updateProviderPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.providerPlanService.remove(id);
  }
}
