import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../base-entity';
import { Required } from '../../decorators/required.decorator';
import Board from '../board/board.entity';

@Entity({ name: 'columns' })
export default class BoardColumn extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'column_name', type: 'varchar' })
  @Required()
  columnName!: string;

  @ManyToOne(() => Board, (board) => board.columns, { cascade: true })
  @JoinColumn({ name: 'board_id' })
  board!: Board;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
