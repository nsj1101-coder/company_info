import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { UpdateCoupleDto } from './dto/update-couple.dto';

@Controller('couple')
export class CoupleController {
  constructor(private readonly service: CoupleService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Patch()
  update(@Body() dto: UpdateCoupleDto) {
    return this.service.update(dto);
  }
}
