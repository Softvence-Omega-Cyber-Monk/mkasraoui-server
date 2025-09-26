import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProviderPlanDto } from './dto/create-provider-plan.dto';
import { UpdateProviderPlanDto } from './dto/update-provider-plan.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class ProviderPlanService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. CREATE PLAN
  async create(createProviderPlanDto: CreateProviderPlanDto) {
    return this.prisma.provider_plan.create({
      data: {
        ...createProviderPlanDto,
      },
    });
  }

  async findAll() {
    return this.prisma.provider_plan.findMany();
  }

  async findOne(id: string) {
    const plan = await this.prisma.provider_plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Provider Plan with ID "${id}" not found.`);
    }

    return plan;
  }

  // 4. UPDATE PLAN
  async update(id: string, updateProviderPlanDto: UpdateProviderPlanDto) {
    try {
      const updatedPlan = await this.prisma.provider_plan.update({
        where: { id },
        data: updateProviderPlanDto,
      });

      return updatedPlan;
    } catch (error) {
      if (error.code === 'P2025' || error.name === 'NotFoundError') {
        throw new NotFoundException(`Provider Plan with ID "${id}" not found.`);
      }
      throw error;
    }
  }

  // 5. DELETE PLAN
  async remove(id: string) {
    try {
      const removedPlan = await this.prisma.provider_plan.delete({
        where: { id },
      });

      return removedPlan;
    } catch (error) {
      // Check for Prisma record not found error (P2025)
      if (error.code === 'P2025') {
        throw new NotFoundException(`Provider Plan with ID "${id}" not found.`);
      }
      throw error;
    }
  }
}