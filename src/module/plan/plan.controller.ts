
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Public } from 'src/common/decorators/public.decorators';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  create(@Body() createPlanDto: CreatePlanDto): Promise<any> {
    return this.planService.create(createPlanDto);
  }

  @Get()
  @Public()
  async findAll(): Promise<any> {
    const res = await this.planService.findAll();
    return res;
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<any> {
    return this.planService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto): Promise<any> {
    return this.planService.update(id, updatePlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.planService.remove(id);
  }
}