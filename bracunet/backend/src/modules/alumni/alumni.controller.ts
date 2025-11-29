import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AlumniService } from './alumni.service';
import { CreateAlumniDto } from './dto/create-alumni.dto';
import { Alumni } from './schemas/alumni.schema';

@Controller('alumni')
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @Post()
  async create(@Body() createAlumniDto: CreateAlumniDto): Promise<Alumni> {
    return this.alumniService.create(createAlumniDto);
  }

  @Get()
  async findAll(): Promise<Alumni[]> {
    return this.alumniService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Alumni> {
    return this.alumniService.findOne(id);
  }
}