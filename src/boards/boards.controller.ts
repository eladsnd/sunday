import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards')
export class BoardsController {
    constructor(private readonly boardsService: BoardsService) { }

    @Get()
    findAll() {
        return this.boardsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.boardsService.findOne(id);
    }

    @Post()
    create(@Body() createBoardDto: CreateBoardDto) {
        return this.boardsService.create(createBoardDto);
    }

    @Post('seed')
    @HttpCode(HttpStatus.CREATED)
    seedJobSearchBoard() {
        return this.boardsService.seedJobSearchBoard();
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
        return this.boardsService.update(id, updateBoardDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.boardsService.remove(id);
    }
}
