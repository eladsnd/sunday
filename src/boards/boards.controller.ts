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
    UseGuards,
    Req,
} from '@nestjs/common';
import { Request } from 'express';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
    constructor(private readonly boardsService: BoardsService) { }

    @Get()
    findAll(@Req() req: Request) {
        const userId = (req.user as any).userId;
        return this.boardsService.findAll(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: Request) {
        const userId = (req.user as any).userId;
        return this.boardsService.findOne(id, userId);
    }

    @Post()
    create(@Body() createBoardDto: CreateBoardDto, @Req() req: Request) {
        const userId = (req.user as any).userId;
        return this.boardsService.create(createBoardDto, userId);
    }

    @Post('seed')
    @HttpCode(HttpStatus.CREATED)
    seedJobSearchBoard(@Req() req: Request) {
        const userId = (req.user as any).userId;
        return this.boardsService.seedJobSearchBoard(userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto, @Req() req: Request) {
        const userId = (req.user as any).userId;
        return this.boardsService.update(id, updateBoardDto, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string, @Req() req: Request) {
        const userId = (req.user as any).userId;
        return this.boardsService.remove(id, userId);
    }
}
