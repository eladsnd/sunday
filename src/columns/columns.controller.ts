import { Controller, Post, Body, Delete, Param, Patch } from '@nestjs/common';
import { ColumnsService } from './columns.service';

@Controller('columns')
export class ColumnsController {
    constructor(private readonly columnsService: ColumnsService) { }

    @Post()
    create(@Body() body: { boardId: string; label: string; type: any }) {
        return this.columnsService.create(body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.columnsService.remove(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.columnsService.update(id, body);
    }
}
