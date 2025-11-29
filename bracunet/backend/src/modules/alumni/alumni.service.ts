import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alumni, AlumniDocument } from './schemas/alumni.schema';
import { CreateAlumniDto } from './dto/create-alumni.dto';
import { UpdateAlumniDto } from './dto/update-alumni.dto';

@Injectable()
export class AlumniService {
  constructor(@InjectModel(Alumni.name) private alumniModel: Model<AlumniDocument>) {}

  async create(createAlumniDto: CreateAlumniDto): Promise<AlumniDocument> {
    const newAlumni = new this.alumniModel(createAlumniDto);
    return newAlumni.save();
  }

  async findAll(): Promise<AlumniDocument[]> {
    return this.alumniModel.find().exec();
  }

  async findOne(id: string): Promise<AlumniDocument> {
    const alumni = await this.alumniModel.findById(id).exec();
    if (!alumni) throw new NotFoundException('Alumni not found');
    return alumni;
  }

  async update(id: string, updateAlumniDto: UpdateAlumniDto): Promise<AlumniDocument> {
    const alumni = await this.alumniModel.findByIdAndUpdate(id, updateAlumniDto, { new: true }).exec();
    if (!alumni) throw new NotFoundException('Alumni not found');
    return alumni;
  }

  async remove(id: string): Promise<AlumniDocument> {
    const alumni = await this.alumniModel.findByIdAndDelete(id).exec();
    if (!alumni) throw new NotFoundException('Alumni not found');
    return alumni;
  }
}