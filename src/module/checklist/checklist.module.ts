import { Module } from '@nestjs/common';
import { TasksController } from './checklist.controller';
import { TasksService } from './checklist.service';


@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class ChecklistModule {}
