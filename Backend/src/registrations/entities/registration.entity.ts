import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RegistrationDocument = Registration & Document;

@Schema()
class TeamStats {
  @Prop({ default: 0 })
  wins: number;

  @Prop({ default: 0 })
  draws: number;

  @Prop({ default: 0 })
  losses: number;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: 0 })
  goalsFor: number;

  @Prop({ default: 0 })
  goalsAgainst: number;

  @Prop({ default: 0 })
  yellowCards: number;

  @Prop({ default: 0 })
  redCards: number;

  @Prop({ default: 0 })
  blueCards: number;

  @Prop({ default: 0 })
  fairPlayScore: number;

  @Prop({ default: 0 })
  goalDifference: number;

  @Prop({ default: 0 })
  scoreWeight: number;
}

@Schema()
export class Registration extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true })
  tournamentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Phase', required: false })
  phaseId?: Types.ObjectId;

  @Prop({ default: Date.now })
  registrationDate: Date;

  @Prop({ type: TeamStats, default: () => ({}) })
  stats: TeamStats;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);
