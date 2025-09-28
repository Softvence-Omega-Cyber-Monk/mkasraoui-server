// app.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcomePage(@Res() res: Response): void {
    const indexPath = join(process.cwd(), 'public', 'index.html');

    res.sendFile(indexPath);
  }

}