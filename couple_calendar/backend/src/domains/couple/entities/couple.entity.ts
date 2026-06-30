import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('couple')
export class Couple {
  // 단일 설정 레코드 (항상 id=1)
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({ length: 10, default: '나' })
  me: string;

  @Column({ length: 10, default: '그대' })
  partner: string;

  // YYYY-MM-DD (없으면 빈 문자열)
  @Column({ type: 'varchar', length: 10, default: '' })
  anniversary: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
