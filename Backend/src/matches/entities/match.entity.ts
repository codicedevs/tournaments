import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Team, TeamDocument } from '../../teams/entities/team.entity';
import { MatchEventType } from '../enums/match-event-type.enum';

@Schema()
export class MatchEvent {
  @Prop({ required: true, enum: MatchEventType })
  type: MatchEventType;

  @Prop({ required: false })
  minute?: number;

  @Prop({ required: false, enum: ['TeamA', 'TeamB'] })
  team?: 'TeamA' | 'TeamB';

  @Prop({ required: false, type: Types.ObjectId, ref: 'Player' })
  playerId?: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

@Schema()
export class PlayerMatch {
  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  playerId: Types.ObjectId;

  @Prop({ required: true })
  jerseyNumber: number;

  @Prop({ default: true })
  enableToPlay: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;
}

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Match extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamA: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamB: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, default: 0 })
  homeScore: number;

  @Prop({ type: Number, default: 0 })
  awayScore: number;

  @Prop({ type: String, enum: ['TeamA', 'TeamB', 'Draw'], default: null })
  result: 'TeamA' | 'TeamB' | 'Draw' | null;

  @Prop({ type: Types.ObjectId, ref: 'Matchday' })
  matchDayId: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @Prop({ type: [MatchEvent], default: [] })
  events: MatchEvent[];

  @Prop({ type: [PlayerMatch], default: [] })
  playerMatches: PlayerMatch[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  viewerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  refereeId?: Types.ObjectId;

  @Prop({ type: String, required: false })
  fieldNumber?: string;
}

export type MatchDocument = Match & Document;
export const MatchSchema = SchemaFactory.createForClass(Match);

// Middleware para actualizar el resultado cuando se actualizan los scores
MatchSchema.pre('save', function (next) {
  if (this.isModified('homeScore') || this.isModified('awayScore')) {
    if (this.homeScore !== null && this.awayScore !== null) {
      if (this.homeScore > this.awayScore) {
        this.result = 'TeamA';
      } else if (this.homeScore < this.awayScore) {
        this.result = 'TeamB';
      } else {
        this.result = 'Draw';
      }
    }
  }
  next();
});
