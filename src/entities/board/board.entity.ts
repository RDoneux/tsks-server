import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../base-entity';
import { Required } from '../../decorators/required.decorator';
import BoardColumn from '../board-columns/BoardColumn.entity';

@Entity({ name: 'boards' })
export default class Board extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'board_name', type: 'varchar' })
  @Required()
  boardName!: string;

  @OneToMany(() => BoardColumn, (boardColumn) => boardColumn.board, { cascade: true })
  columns!: BoardColumn[];

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  columnCount!: number;
}
