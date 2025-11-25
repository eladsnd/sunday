import { Controller, Patch, Param, Body } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { UpdateGroupPositionDto } from './dto/update-group-position.dto';

@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) { }

    @Patch(':id/position')
    updatePosition(
        @Param('id') id: string,
        @Body() updateGroupPositionDto: UpdateGroupPositionDto,
    ) {
        return this.groupsService.updatePosition(id, updateGroupPositionDto);
    }
}
