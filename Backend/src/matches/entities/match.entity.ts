import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MatchResult {
  HOME = 'Home',
  AWAY = 'Away',
  DRAW = 'Draw',
}

@Schema()
export class Match extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamA: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamB: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, enum: MatchResult, required: false })
  result: MatchResult;

  @Prop({ type: Types.ObjectId, ref: 'Matchday', required: false })
  matchDayId: Types.ObjectId;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
