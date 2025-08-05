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
  @Prop()
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: Role })
  role: Role;

  @Prop({ required: true })
  name: string;

  @Prop()
  username: string;

  @Prop({ unique: true, sparse: true, default: null, nullable: true })
  dni?: string;

  @Prop()
  birthDate: Date;

  @Prop()
  occupation: string;

  @Prop()
  healthInsurance: string;

  @Prop()
  profilePicture: string;

  @Prop()
  phone: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isBlacklisted: boolean;

  @Prop({ default: true })
  mustChangePassword: boolean;

  @Prop()
  lastPasswordChange: Date;

  @Prop({ type: [String], default: [] })
  pdfs: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
