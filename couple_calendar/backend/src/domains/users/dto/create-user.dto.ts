import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  // 아이디: 영문 소문자/숫자 6~16자
  @Matches(/^[a-z0-9]{6,16}$/, {
    message: '아이디는 영문 소문자/숫자 6~16자로 입력하세요.',
  })
  username: string;

  // 비밀번호: 10~20자, 영문/숫자/특수문자 중 2종 이상 조합
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)|(?=.*[A-Za-z])(?=.*[^A-Za-z0-9])|(?=.*\d)(?=.*[^A-Za-z0-9])/,
    { message: '비밀번호는 영문/숫자/특수문자 중 2가지 이상을 조합하세요.' },
  )
  @Matches(/^.{10,20}$/, { message: '비밀번호는 10~20자로 입력하세요.' })
  password: string;

  @IsString()
  @MaxLength(20)
  name: string;

  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  @MaxLength(120)
  email: string;

  @Matches(/^01[0-9]\d{7,8}$/, { message: '휴대폰 번호 형식이 올바르지 않습니다.' })
  phone: string;

  @IsOptional()
  @IsIn(['', 'male', 'female'])
  gender?: string;

  @IsBoolean()
  agreeMarketing: boolean;
}
