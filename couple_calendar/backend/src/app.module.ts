import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesModule } from './domains/schedules/schedules.module';
import { PlansModule } from './domains/plans/plans.module';
import { CoupleModule } from './domains/couple/couple.module';
import { UsersModule } from './domains/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'couple',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'couple',
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNC === 'true',
      charset: 'utf8mb4',
      timezone: '+09:00',
    }),
    SchedulesModule,
    PlansModule,
    CoupleModule,
    UsersModule,
  ],
})
export class AppModule {}
