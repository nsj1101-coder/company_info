import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ScheduleCategory, ScheduleOwner } from '../entities/schedule.entity';

export class CreateScheduleDto {
  @IsString()
  @MaxLength(60)
  title: string;

  @IsIn(['date', 'anniv', 'promise', 'todo', 'etc'])
  category: ScheduleCategory;

  @IsIn(['me', 'partner', 'both'])
  owner: ScheduleOwner;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date 는 YYYY-MM-DD 형식이어야 합니다.' })
  date: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$|^$/, { message: 'time 은 HH:mm 형식이어야 합니다.' })
  time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  addrDetail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  memo?: string;

  @IsOptional()
  @IsBoolean()
  remind?: boolean;
}
