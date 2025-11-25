import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CreateAutomationDto {
    @IsString()
    @IsNotEmpty()
    boardId: string;

    @IsString()
    @IsNotEmpty()
    triggerType: string;

    @IsObject()
    @IsNotEmpty()
    triggerConfig: any;

    @IsString()
    @IsNotEmpty()
    actionType: string;

    @IsObject()
    @IsNotEmpty()
    actionConfig: any;
}
