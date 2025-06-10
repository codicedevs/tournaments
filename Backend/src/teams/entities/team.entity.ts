import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User, UserDocument } from '../../users/entities/user.entity';

export type TeamDocument = Team & Document;

@Schema()
class TeamStats {
  @Prop({ default: 0 })
  goalsFor: number;

  @Prop({ default: 0 })
  goalsAgainst: number;

  @Prop({ default: 0 })
  wins: number;

  @Prop({ default: 0 })
  losses: number;

  @Prop({ default: 0 })
  draws: number;
}

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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  players: (User | UserDocument | Types.ObjectId)[];

  @Prop({ type: TeamStats, default: () => ({}) })
  stats: TeamStats;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
