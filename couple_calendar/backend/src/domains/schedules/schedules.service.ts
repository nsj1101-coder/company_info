import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly repo: Repository<Schedule>,
  ) {}

  create(dto: CreateScheduleDto): Promise<Schedule> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(month?: string): Promise<Schedule[]> {
    const qb = this.repo.createQueryBuilder('s');
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      qb.where('s.date LIKE :m', { m: `${month}-%` });
    }
    return qb.orderBy('s.date', 'ASC').addOrderBy('s.time', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Schedule> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`일정(${id})을 찾을 수 없습니다.`);
    return found;
  }

  async update(id: number, dto: UpdateScheduleDto): Promise<Schedule> {
    const found = await this.findOne(id);
    Object.assign(found, dto);
    return this.repo.save(found);
  }

  async remove(id: number): Promise<void> {
    const found = await this.findOne(id);
    await this.repo.remove(found);
  }
}
