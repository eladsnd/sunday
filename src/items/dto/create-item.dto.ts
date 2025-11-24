import { IsString, IsUUID } from 'class-validator';

export class CreateItemDto {
    @IsString()
    name: string;

    @IsUUID()
    groupId: string;

    @IsUUID()
    boardId: string;
}
