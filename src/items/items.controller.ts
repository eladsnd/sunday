import {
    Controller,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateItemPositionDto } from './dto/update-item-position.dto';

@Controller('items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) { }

    @Post()
    create(@Body() createItemDto: CreateItemDto) {
        return this.itemsService.create(createItemDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
        return this.itemsService.update(id, updateItemDto);
    }

    @Patch(':id/position')
    updatePosition(
        @Param('id') id: string,
        @Body() updatePositionDto: UpdateItemPositionDto,
    ) {
        return this.itemsService.updatePosition(id, updatePositionDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.itemsService.remove(id);
    }
}
