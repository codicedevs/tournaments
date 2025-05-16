import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PhaseType {
  GROUP = 'GROUP',
  KNOCKOUT = 'KNOCKOUT',
  LEAGUE = 'LEAGUE',
  FINAL = 'FINAL',
  QUALIFYING = 'QUALIFYING',
}

export type PhaseDocument = Phase & Document;

@Schema()
export class Phase extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: String,
    enum: PhaseType,
    default: PhaseType.GROUP,
    required: true,
  })
  type: PhaseType;

  @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true })
  tournamentId: Types.ObjectId;
}

export const PhaseSchema = SchemaFactory.createForClass(Phase);
