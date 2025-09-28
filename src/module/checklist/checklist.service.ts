import { Injectable, NotFoundException } from '@nestjs/common';

import { Task } from '@prisma/client';
import { differenceInDays, isToday, isWithinInterval, addDays } from 'date-fns'; 
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-checklist.dto';
import { UpdateTaskDto } from './dto/update-checklist.dto';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {

        return this.prisma.task.create({
            data: {
                ...createTaskDto,
                userId: userId,
                daysAhead: 0,
            },
        });
    }

    async findAll(userId: string): Promise<Task[]> {

        return this.prisma.task.findMany({
            where: { userId },
            orderBy: { dueDate: 'asc' },
        });
    }
    
    async findOne(id: string): Promise<Task> {
        const task = await this.prisma.task.findUnique({ where: { id } });
        
        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found.`);
        }
        return task;
    }

    async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        try {
            return await this.prisma.task.update({
                where: { id },
                data: updateTaskDto,
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Task with ID ${id} not found.`);
            }
            throw error;
        }
    }

    async remove(id: string): Promise<Task> {
        try {
            return await this.prisma.task.delete({ where: { id } });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Task with ID ${id} not found.`);
            }
            throw error;
        }
    }
    
    // --- Custom View Logic ---

    async findTasksByCategory(userId: string) {
        const tasks = await this.findAll(userId);
        return tasks.reduce((acc, task) => {
            const category = task.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(task);
            return acc;
        }, {} as Record<string, Task[]>);
    }

    async findTasksTimeline(userId: string) {
        const tasks = await this.findAll(userId);
        const now = new Date();
        
        const timeline = {
            today: [] as Task[],
            next2Days: [] as Task[],
            thisWeek: [] as Task[],
            later: [] as Task[],
        };

        for (const task of tasks) {
            const dueDate = task.dueDate;
            
            const daysToDue = differenceInDays(dueDate, now);
            
            if (isToday(dueDate)) {
                timeline.today.push(task);
            } else if (daysToDue > 0 && daysToDue <= 2) {
                timeline.next2Days.push(task);
            } else if (daysToDue > 2 && daysToDue <= 7) {
                timeline.thisWeek.push(task);
            } else {
                timeline.later.push(task);
            }
        }

        return timeline;
    }
}