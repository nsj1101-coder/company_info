import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async isUsernameAvailable(username: string): Promise<boolean> {
    if (!/^[a-z0-9]{6,16}$/.test(username)) return false;
    const count = await this.repo.count({ where: { username } });
    return count === 0;
  }

  async register(dto: CreateUserDto): Promise<{ id: number; username: string }> {
    const dup = await this.repo.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (dup) {
      throw new ConflictException(
        dup.username === dto.username ? '이미 사용 중인 아이디입니다.' : '이미 가입된 이메일입니다.',
      );
    }
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.repo.save(this.repo.create({ ...dto, password }));
    return { id: user.id, username: user.username };
  }
}
