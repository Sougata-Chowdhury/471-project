import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AlumniDocument = Alumni & Document;

@Schema({ timestamps: true })
export class Alumni {
  @Prop({ required: true })
  name!: string;

  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop()
  batch?: number;

  @Prop()
  department?: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const AlumniSchema = SchemaFactory.createForClass(Alumni);
