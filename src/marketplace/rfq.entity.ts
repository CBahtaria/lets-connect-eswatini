import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('rfqs')
export class Rfq {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  listingId: string

  @Column({ type: 'varchar' })
  buyerId: string

  @Column({ type: 'text' })
  message: string

  @Column({ type: 'integer' })
  budgetCents: number

  @Column({ type: 'varchar', default: 'pending' })
  status: string

  @CreateDateColumn()
  createdAt: Date
}
