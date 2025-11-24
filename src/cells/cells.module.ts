import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CellsController } from './cells.controller';
import { CellsService } from './cells.service';
import { CellValue } from '../entities/cell-value.entity';
import { Item } from '../entities/item.entity';
import { BoardColumn } from '../entities/column.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CellValue, Item, BoardColumn])],
    controllers: [CellsController],
    providers: [CellsService],
    exports: [CellsService],
})
export class CellsModule { }
