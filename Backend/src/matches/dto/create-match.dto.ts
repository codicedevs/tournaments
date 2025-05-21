export class CreateMatchDto {
  teamA: string;
  teamB: string;
  date: Date;
  result: 'TeamA' | 'TeamB' | 'Draw';
  matchDayId?: string;
}
