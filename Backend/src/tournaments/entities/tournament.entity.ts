import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Phase } from 'src/phases/entities/phase.entity';

export type TournamentDocument = Tournament & Document;

@Schema()
export class Tournament extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Phase' }] })
  phases: (Phase | Types.ObjectId | string)[];
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
