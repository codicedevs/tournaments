import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Match } from 'src/matches/entities/match.entity';
import { Schema as MongooseSchema } from 'mongoose';

export type MatchdayDocument = Matchday & Document;

@Schema()
export class Matchday extends Document {
  @Prop({ required: true })
  order: number;

  @Prop({ type: Types.ObjectId, ref: 'Phase', required: true })
  phaseId: Types.ObjectId;

  @Prop({ type: Date, required: false })
  date?: Date;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Match' }] })
  matches: (Match | Types.ObjectId | string)[];
}

export const MatchdaySchema = SchemaFactory.createForClass(Matchday);
