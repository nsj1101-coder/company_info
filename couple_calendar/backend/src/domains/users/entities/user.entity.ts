import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  username: string;

  @Column({ unique: true, length: 120 })
  email: string;

  // bcrypt 해시 (응답에서는 제외)
  @Column({ length: 100, select: false })
  password: string;

  @Column({ length: 20 })
  name: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 10, default: '' })
  gender: string;

  @Column({ type: 'boolean', default: false })
  agreeMarketing: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
