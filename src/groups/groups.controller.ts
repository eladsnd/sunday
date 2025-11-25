import { Controller, Patch, Param, Body, Post, Delete } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { UpdateGroupPositionDto } from './dto/update-group-position.dto';
import { CreateGroupDto } from './dto/create-group.dto';

@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) { }

    @Post()
    create(@Body() createGroupDto: CreateGroupDto) {
        return this.groupsService.create(createGroupDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.groupsService.remove(id);
    }

    @Patch(':id/position')
    updatePosition(
        @Param('id') id: string,
        @Body() updateGroupPositionDto: UpdateGroupPositionDto,
    ) {
        return this.groupsService.updatePosition(id, updateGroupPositionDto);
    }
}
