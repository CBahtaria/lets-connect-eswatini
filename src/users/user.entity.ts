import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ nullable: true, type: 'timestamptz' })
  locked_until: Date | null;

  @Column({ default: 0 })
  otp_attempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  verified: boolean;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true, nullable: true })
  profile?: Profile;
}
