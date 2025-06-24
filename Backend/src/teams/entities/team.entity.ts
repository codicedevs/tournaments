import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Player } from 'src/players/entities/player.entity';
import { User } from 'src/users/entities/user.entity';
import mongoose from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
export type TeamDocument = Team & Document;

@Schema()
export class Team extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  coach?: string;

  @Prop()
  profileImage?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdById: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Player' }] })
  players: (Player | Types.ObjectId | string)[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
