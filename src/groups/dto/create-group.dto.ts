import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateGroupDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsUUID()
    @IsNotEmpty()
    boardId: string;

    @IsString()
    @IsOptional()
    color?: string;
}
