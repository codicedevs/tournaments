import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PhaseDocument = Phase & Document;

@Schema()
export class Phase extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true })
  tournamentId: Types.ObjectId;
}

export const PhaseSchema = SchemaFactory.createForClass(Phase);
