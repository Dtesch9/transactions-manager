import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Category from './Category';

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('float4')
  value: number;

  @Column({
    type: 'enum',
    enum: ['income', 'outcome'],
    default: 'income',
  })
  type: 'income' | 'outcome';

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'title' })
  category_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Transaction;
