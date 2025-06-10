import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

  @Prop({ type: Number, required: false, default: null })
  homeScore: number;

  @Prop({ type: Number, required: false, default: null })
  awayScore: number;

  @Prop({ type: String, enum: ['TeamA', 'TeamB', 'Draw'], required: false })
  result: 'TeamA' | 'TeamB' | 'Draw';

  @Prop({ type: Types.ObjectId, ref: 'Matchday', required: false })
  matchDayId: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  completed: boolean;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

// Método virtual para determinar el resultado basado en los scores
MatchSchema.virtual('determineResult').get(function () {
  if (this.homeScore === null || this.awayScore === null) {
    return null;
  }
});

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
      this.completed = true;
    }
  }
  next();
});
