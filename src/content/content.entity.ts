import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column({ type: 'text', nullable: true })
  body: string

  @Column({ default: 'draft' })
  status: string

  @CreateDateColumn()
  created_at: Date
}
