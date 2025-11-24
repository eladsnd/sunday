import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item } from '../entities/item.entity';
import { Group } from '../entities/group.entity';
import { Board } from '../entities/board.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Item, Group, Board])],
    controllers: [ItemsController],
    providers: [ItemsService],
    exports: [ItemsService],
})
export class ItemsModule { }
