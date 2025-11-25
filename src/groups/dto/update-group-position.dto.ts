import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateGroupPositionDto {
    @IsInt()
    @IsNotEmpty()
    position: number;
}
