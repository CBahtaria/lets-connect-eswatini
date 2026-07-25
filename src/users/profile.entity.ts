import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng?: number;

  @Column({ nullable: true })
  city?: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
