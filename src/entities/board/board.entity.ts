import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../base-entity';
import { Required } from '../../decorators/required.decorator';

@Entity({ name: 'boards' })
export default class Board extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'board_name', type: 'varchar' })
  @Required()
  boardName!: string;

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
