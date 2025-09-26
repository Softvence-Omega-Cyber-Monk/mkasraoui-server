
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Public } from 'src/common/decorators/public.decorators';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  async create(@Body() createPlanDto: CreatePlanDto): Promise<any> {
    try{
      const res=await this.planService.create(createPlanDto);
      return res
    }catch(error){
     throw new HttpException(error.message, 500);
    }
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