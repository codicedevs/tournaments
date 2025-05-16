import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RegistrationDocument = Registration & Document;

@Schema()
export class Registration extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true })
  tournamentId: Types.ObjectId;
  
  @Prop({ default: Date.now })
  registrationDate: Date;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);
