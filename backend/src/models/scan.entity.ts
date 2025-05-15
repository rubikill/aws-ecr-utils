import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Scan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  repositoryName: string;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  completedAt: Date;

  @Column({ default: 'pending' })
  status: 'pending' | 'in_progress' | 'success' | 'error';

  @Column({ nullable: true })
  errorMessage: string;
}

export {};
