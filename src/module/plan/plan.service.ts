// src/plan/plan.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Plan, Prisma } from '@prisma/client';

interface ResponseData<T> {
  message: string;
  data: T;
}

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

   async create(createPlanDto:any): Promise<ResponseData<Plan>> {
    const { price_id, ...dataToCreate } = createPlanDto;
    
    const data: Prisma.PlanCreateInput = {
      ...dataToCreate,
      features: dataToCreate.features as unknown as Prisma.JsonValue,
      price: dataToCreate.price ?? 0,
      is_active: dataToCreate.is_active ?? true,
      ...(price_id && { price_id }),
    };

    const newPlan = await this.prisma.plan.create({
      data,
    });
    
    return {
      message: 'Plan created successfully',
      data: newPlan,
    };
  }

  async findAll(): Promise<ResponseData<Plan[]>> {
    const plans = await this.prisma.plan.findMany();
    return {
      message: 'Plans retrieved successfully',
      data: plans,
    };
  }

  async findOne(id: string): Promise<ResponseData<Plan>> {
    const plan = await this.prisma.plan.findUnique({
      where: {
        id: id,
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return {
      message: 'Plan retrieved successfully',
      data: plan,
    };
  }

  async update(id: string, updatePlanDto:any): Promise<ResponseData<Plan>> {
    try {
      const updatedPlan = await this.prisma.plan.update({
        where: {
          id: id,
        },
        data: {
          name: updatePlanDto.planName,
          features: updatePlanDto.features,
          price: updatePlanDto.price,
          is_active: updatePlanDto.is_active,
        },
      });
      return {
        message: 'Plan updated successfully',
        data: updatedPlan,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<ResponseData<null>> {
    try {
      await this.prisma.plan.delete({
        where: {
          id: id,
        },
      });
      return {
        message: 'Plan deleted successfully',
        data: null,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }
      throw error;
    }
  }
}