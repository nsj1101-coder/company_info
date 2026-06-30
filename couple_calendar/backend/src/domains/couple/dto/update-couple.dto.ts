import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateCoupleDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  me?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  partner?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$|^$/, { message: 'anniversary 는 YYYY-MM-DD 형식이어야 합니다.' })
  anniversary?: string;
}
