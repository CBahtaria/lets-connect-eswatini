import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('compression_jobs')
export class CompressionJob {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  user_id: string

  @Column()
  status: string

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, unknown>

  @CreateDateColumn()
  created_at: Date
}
