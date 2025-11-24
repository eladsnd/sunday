import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CellValue } from '../entities/cell-value.entity';
import { UpdateCellValueDto } from './dto/update-cell-value.dto';

@Injectable()
export class CellsService {
    constructor(
        @InjectRepository(CellValue)
        private cellValueRepository: Repository<CellValue>,
    ) { }

    async updateCellValue(
        itemId: string,
        columnId: string,
        updateCellValueDto: UpdateCellValueDto,
    ): Promise<CellValue> {
        // Find existing cell value or create new one
        let cellValue = await this.cellValueRepository.findOne({
            where: { itemId, columnId },
        });

        if (cellValue) {
            cellValue.value = updateCellValueDto.value;
        } else {
            cellValue = this.cellValueRepository.create({
                itemId,
                columnId,
                value: updateCellValueDto.value,
            });
        }

        return this.cellValueRepository.save(cellValue);
    }
}
