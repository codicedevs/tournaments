import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Match extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamA: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamB: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, enum: ['TeamA', 'TeamB', 'Draw'], required: false })
  result: 'TeamA' | 'TeamB' | 'Draw';
}

export const MatchSchema = SchemaFactory.createForClass(Match);
