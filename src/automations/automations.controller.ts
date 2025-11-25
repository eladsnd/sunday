import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';

@Controller('automations')
export class AutomationsController {
    constructor(private readonly automationsService: AutomationsService) { }

    @Post()
    create(@Body() createAutomationDto: CreateAutomationDto) {
        return this.automationsService.create(createAutomationDto);
    }

    @Get()
    findAll(@Query('boardId') boardId: string) {
        return this.automationsService.findAll(boardId);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.automationsService.delete(id);
    }
}
