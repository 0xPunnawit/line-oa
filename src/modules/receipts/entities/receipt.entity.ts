import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn({ name: 'receipt_id' })
  receiptId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  seller: string | null;

  @Column({ name: 'receipt_date', type: 'varchar' })
  receiptDate: string;

  @Column({ name: 'receipt_no', type: 'varchar' })
  receiptNo: string;

  @Column({ type: 'decimal' })
  amount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
