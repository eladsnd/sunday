import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class UpdateItemPositionDto {
    @IsNumber()
    position: number;

    @IsOptional()
    @IsUUID()
    groupId?: string;
}
