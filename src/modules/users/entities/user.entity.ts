import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** TypeORM entity: maps to 'users' table. Tracks LINE user ID and loyalty points. */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({
    name: 'line_user_id',
    type: 'varchar',
    unique: true,
    nullable: false,
  })
  lineUserId: string;

  @Column({ type: 'integer', default: 0 })
  point: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
