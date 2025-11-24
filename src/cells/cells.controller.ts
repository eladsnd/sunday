import { Controller, Patch, Param, Body } from '@nestjs/common';
import { CellsService } from './cells.service';
import { UpdateCellValueDto } from './dto/update-cell-value.dto';

@Controller('cells')
export class CellsController {
    constructor(private readonly cellsService: CellsService) { }

    @Patch(':itemId/:columnId')
    updateCellValue(
        @Param('itemId') itemId: string,
        @Param('columnId') columnId: string,
        @Body() updateCellValueDto: UpdateCellValueDto,
    ) {
        return this.cellsService.updateCellValue(
            itemId,
            columnId,
            updateCellValueDto,
        );
    }
}
