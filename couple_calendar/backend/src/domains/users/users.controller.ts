import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  // 아이디 중복확인
  @Get('check-username')
  async checkUsername(@Query('value') value = '') {
    return { available: await this.service.isUsernameAvailable(value) };
  }

  // 회원가입
  @Post()
  register(@Body() dto: CreateUserDto) {
    return this.service.register(dto);
  }
}
