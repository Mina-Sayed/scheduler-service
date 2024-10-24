import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'timestamp' })
  lastRun: Date;

  @Column({ type: 'timestamp' })
  nextRun: Date;

  @Column()
  cronExpression: string; // e.g., '*/5 * * * *'
}
