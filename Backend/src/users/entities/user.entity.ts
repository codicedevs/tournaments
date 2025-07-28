import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum Role {
  Admin = 'Admin',
  Moderator = 'Moderator',
  Player = 'Player',
  Viewer = 'Viewer',
  Referee = 'Referee',
}

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: Role })
  role: Role;

  @Prop({ required: true })
  name: string;

  @Prop()
  profilePicture: string;

  @Prop()
  phone: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: true })
  mustChangePassword: boolean;

  @Prop()
  lastPasswordChange: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
