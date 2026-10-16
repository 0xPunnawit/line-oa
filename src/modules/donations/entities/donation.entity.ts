import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DonationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn({ name: 'donate_id' })
  donateId!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'line_user_id', length: 255 })
  lineUserId!: string;

  @Column({ type: 'integer' })
  points!: number;

  @Column({
    type: 'text',
    default: DonationStatus.PENDING,
  })
  status!: DonationStatus;

  @Column({ name: 'external_transaction_id', nullable: true })
  externalTransactionId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
