import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MatchdayDocument = Matchday & Document;

@Schema()
export class Matchday extends Document {
  @Prop({ required: true })
  order: number;

  @Prop({ type: Types.ObjectId, ref: 'Phase', required: true })
  phaseId: Types.ObjectId;
}

export const MatchdaySchema = SchemaFactory.createForClass(Matchday);
