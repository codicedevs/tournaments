import { IsEnum, IsOptional } from 'class-validator';

export class UpdateMatchDto {
  @IsEnum(['TeamA', 'TeamB', 'Draw'], {
    message: 'Result must be TeamA, TeamB, or Draw',
  })
  @IsOptional()
  result?: 'TeamA' | 'TeamB' | 'Draw';
}
