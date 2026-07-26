import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  sellerId: string

  @Column({ type: 'varchar', length: 200 })
  title: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'varchar' })
  category: string

  @Column({ type: 'integer' })
  priceCents: number

  @Column({ type: 'varchar', length: 3, default: 'SZL' })
  currency: string

  @Column({ type: 'varchar', length: 100 })
  location: string

  @Column({ type: 'boolean', default: false })
  verified: boolean

  @Column({ type: 'boolean', default: true })
  active: boolean

  @Column({ type: 'integer', default: 0 })
  viewCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
