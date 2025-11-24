import { IsNotEmpty } from 'class-validator';

export class UpdateCellValueDto {
    @IsNotEmpty()
    value: any; // Flexible JSONB value
}
