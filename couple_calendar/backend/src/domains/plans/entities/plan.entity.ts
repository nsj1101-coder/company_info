import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 80 })
  text: string;

  @Column({ type: 'boolean', default: false })
  done: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
