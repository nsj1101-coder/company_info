import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Couple } from './entities/couple.entity';
import { UpdateCoupleDto } from './dto/update-couple.dto';

@Injectable()
export class CoupleService {
  constructor(
    @InjectRepository(Couple)
    private readonly repo: Repository<Couple>,
  ) {}

  async get(): Promise<Couple> {
    let row = await this.repo.findOne({ where: { id: 1 } });
    if (!row) {
      row = await this.repo.save(this.repo.create({ id: 1 }));
    }
    return row;
  }

  async update(dto: UpdateCoupleDto): Promise<Couple> {
    const row = await this.get();
    Object.assign(row, dto);
    return this.repo.save(row);
  }
}
