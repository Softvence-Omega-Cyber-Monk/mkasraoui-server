// part-generation/part-generation.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartGenerationDto } from './dto/create-part-generation.dto';
import { UpdatePartGenerationDto } from './dto/update-part-generation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PartyPlan } from '@prisma/client';


@Injectable()
export class PartGenerationService {
  constructor(private prisma: PrismaService) {}

  async create(createPartGenerationDto: CreatePartGenerationDto,userId:string): Promise<PartyPlan> {
    const { sections, timelineEvents, suggestedGifts, ...partyPlanData } = createPartGenerationDto;
    return this.prisma.$transaction(async (tx) => {
      const partyPlan = await tx.partyPlan.create({
        data: {
          title: partyPlanData.title,
          userId:userId,
          scheduledDate: new Date(partyPlanData.scheduledDate),
          sections: {
            create: sections.map(section => ({
              name: section.name,
              items: {
                create: section.items,
              },
            })),
          },
          
          timeline: {
            create: {
              events: {
                create: timelineEvents,
              },
            },
          },
          
          suggestedGifts: {
            create: suggestedGifts || [],
          },
        },
      });
      return partyPlan;
    });
  }

  async findAll(userId: string): Promise<any[]> {
  const partyPlans = await this.prisma.partyPlan.findMany({
    where: { userId },
    include: {
      sections: {
        include: {
          items: { orderBy: { sortOrder: 'asc' } },
        },
      },
      timeline: {
        include: {
          events: { orderBy: { sortOrder: 'asc' } },
        },
      },
      suggestedGifts: true,
      _count: {
        select: { invitations: true },
      },
    },
    orderBy: { scheduledDate: 'desc' },
  });

  return partyPlans.map(plan => ({
    ...plan,
    invitationCount: plan._count.invitations,
    
  }));
}

  async findOne(id: string): Promise<PartyPlan> {
    const partyPlan = await this.prisma.partyPlan.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            items: { orderBy: { sortOrder: 'asc' } },
          },
        },
        timeline: {
          include: {
            events: { orderBy: { sortOrder: 'asc' } },
            
          },
        },
        suggestedGifts: true,
        invitations:true
      },
    });

    if (!partyPlan) {
      throw new NotFoundException(`Party Plan with ID ${id} not found.`);
    }
    return partyPlan;
  }

  async update(id: string, updatePartGenerationDto: UpdatePartGenerationDto): Promise<PartyPlan> {
    try {
      // Simple update for the top-level fields
      return this.prisma.partyPlan.update({
        where: { id },
        data: {
          title: updatePartGenerationDto.title,
          scheduledDate: updatePartGenerationDto.scheduledDate ? new Date(updatePartGenerationDto.scheduledDate) : undefined,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Party Plan with ID ${id} not found.`);
      }
      throw error;
    }
  }
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.partyPlan.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Party Plan with ID ${id} not found.`);
      }
      throw error;
    }
  }

  async trackGeneration(userId: string): Promise<{ message: string }> {
    if (!userId) {
      throw new NotFoundException('User ID is required to track generation.');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        total_party_generated: { increment: 1 },
      },
    });
    return { message: 'User party generation count updated.' };
  }
}