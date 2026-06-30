import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ScheduleCategory = 'date' | 'anniv' | 'promise' | 'todo' | 'etc';
export type ScheduleOwner = 'me' | 'partner' | 'both';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 60 })
  title: string;

  @Column({ type: 'varchar', length: 10, default: 'date' })
  category: ScheduleCategory;

  @Column({ type: 'varchar', length: 10, default: 'both' })
  owner: ScheduleOwner;

  // YYYY-MM-DD
  @Column({ type: 'date' })
  date: string;

  // HH:mm (없으면 빈 문자열)
  @Column({ type: 'varchar', length: 5, default: '' })
  time: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  address: string;

  @Column({ type: 'varchar', length: 60, default: '' })
  addrDetail: string;

  @Column({ type: 'varchar', length: 300, default: '' })
  memo: string;

  @Column({ type: 'boolean', default: false })
  remind: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
