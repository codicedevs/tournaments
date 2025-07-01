import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Team } from 'src/teams/entities/team.entity';

@Schema({ timestamps: true })
export class Player extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team', required: true })
  teamId: Team;

  @Prop({
    type: {
      goals: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      blueCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      matchesPlayed: { type: Number, default: 0 },
    },
    default: {},
  })
  stats: {
    goals: number;
    yellowCards: number;
    blueCards: number;
    redCards: number;
    assists: number;
    matchesPlayed: number;
  };

  @Prop({ default: true })
  enabled: boolean;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
