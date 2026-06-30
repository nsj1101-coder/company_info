import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  text: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;
}
