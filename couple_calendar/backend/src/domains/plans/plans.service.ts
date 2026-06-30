import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly repo: Repository<Plan>,
  ) {}

  create(dto: CreatePlanDto): Promise<Plan> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Plan[]> {
    return this.repo.find({ order: { done: 'ASC', createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Plan> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`계획(${id})을 찾을 수 없습니다.`);
    return found;
  }

  async update(id: number, dto: UpdatePlanDto): Promise<Plan> {
    const found = await this.findOne(id);
    Object.assign(found, dto);
    return this.repo.save(found);
  }

  async remove(id: number): Promise<void> {
    const found = await this.findOne(id);
    await this.repo.remove(found);
  }
}
