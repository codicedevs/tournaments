import { IsEnum, IsOptional } from 'class-validator';
import { CreateMatchDto } from './create-match.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateMatchDto extends PartialType(CreateMatchDto) {
  @IsEnum(['TeamA', 'TeamB', 'Draw'], {
    message: 'Result must be TeamA, TeamB, or Draw',
  })
  @IsOptional()
  result?: 'TeamA' | 'TeamB' | 'Draw';
}
