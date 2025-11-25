import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CellsController } from './cells.controller';
import { CellsService } from './cells.service';
import { CellValue } from '../entities/cell-value.entity';
import { AutomationsModule } from '../automations/automations.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CellValue]),
        AutomationsModule,
    ],
    controllers: [CellsController],
    providers: [CellsService],
    exports: [CellsService],
})
export class CellsModule { }
