import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CellValue } from '../entities/cell-value.entity';
import { Item } from '../entities/item.entity';
import { UpdateCellValueDto } from './dto/update-cell-value.dto';
import { AutomationsService } from '../automations/automations.service';

@Injectable()
export class CellsService {
    constructor(
        @InjectRepository(CellValue)
        private cellValueRepository: Repository<CellValue>,
        private automationsService: AutomationsService,
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

        const savedCellValue = await this.cellValueRepository.save(cellValue);

        // Trigger automations
        // Fetch item to get boardId
        // We use the manager to avoid injecting ItemsRepository directly to avoid circular deps if possible,
        // but since we are in a service, we can just use the query builder or manager.
        const item = await this.cellValueRepository.manager.findOne(Item, {
            where: { id: itemId },
            relations: ['group'],
        });

        if (item && item.group) {
            await this.automationsService.checkAndExecuteAutomations(
                item.group.boardId,
                'status_change',
                {
                    columnId,
                    value: updateCellValueDto.value,
                    itemId,
                }
            );
        }

        return savedCellValue;
    }
}
