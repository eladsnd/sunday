import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { Board } from '../entities/board.entity';
import { Group } from '../entities/group.entity';
import { Item } from '../entities/item.entity';
import { BoardColumn } from '../entities/column.entity';
import { CellValue } from '../entities/cell-value.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Board, Group, Item, BoardColumn, CellValue]),
    ],
    controllers: [BoardsController],
    providers: [BoardsService],
    exports: [BoardsService],
})
export class BoardsModule { }
