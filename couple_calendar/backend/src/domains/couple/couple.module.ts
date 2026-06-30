import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Couple } from './entities/couple.entity';
import { CoupleService } from './couple.service';
import { CoupleController } from './couple.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Couple])],
  controllers: [CoupleController],
  providers: [CoupleService],
})
export class CoupleModule {}
