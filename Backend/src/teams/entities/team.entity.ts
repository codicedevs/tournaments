import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/entities/user.entity';

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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  players: (User | UserDocument | Types.ObjectId)[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
