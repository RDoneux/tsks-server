import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../base-entity';
import { Required } from '../../decorators/required.decorator';
import Board from '../board/board.entity';
import Ticket from '../ticket/ticket.entity';

@Entity({ name: 'columns' })
export default class BoardColumn extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Board, (board) => board.columns)
  @JoinColumn({ name: 'board_id' })
  board!: Board;

  @OneToMany(() => Ticket, (ticket) => ticket.column, { cascade: true })
  tickets!: Ticket[];

  @Column({ name: 'column_name', type: 'varchar' })
  @Required()
  columnName!: string;

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
