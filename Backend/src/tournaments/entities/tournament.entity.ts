import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TournamentDocument = Tournament & Document;

@Schema()
export class Tournament extends Document {
  @Prop({ required: true })
  name: string;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
