import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alumni } from './schemas/alumni.schema';
import { CreateAlumniDto } from './dto/create-alumni.dto';
import { UpdateAlumniDto } from './dto/update-alumni.dto';

@Injectable()
export class AlumniService {
  constructor(@InjectModel(Alumni.name) private alumniModel: Model<Alumni>) {}

  async create(createAlumniDto: CreateAlumniDto): Promise<Alumni> {
    const newAlumni = new this.alumniModel(createAlumniDto);
    return newAlumni.save();
  }

  async findAll(): Promise<Alumni[]> {
    return this.alumniModel.find().exec();
  }

  async findOne(id: string): Promise<Alumni> {
    return this.alumniModel.findById(id).exec();
  }

  async update(id: string, updateAlumniDto: UpdateAlumniDto): Promise<Alumni> {
    return this.alumniModel.findByIdAndUpdate(id, updateAlumniDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Alumni> {
    return this.alumniModel.findByIdAndRemove(id).exec();
  }
}