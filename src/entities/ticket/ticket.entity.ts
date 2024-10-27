import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../base-entity';
import BoardColumn from '../board-columns/BoardColumn.entity';
import { Priority } from '../../enums/e-priority.enum';
import { Required } from '../../decorators/required.decorator';

@Entity({ name: 'tickets' })
export default class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => BoardColumn, (boardColumn) => boardColumn.tickets)
  @JoinColumn({ name: 'column_id' })
  column!: BoardColumn;

  @Column({ name: 'ticket_name', type: 'varchar' })
  @Required()
  ticketName!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'priority', type: 'varchar', length: 8, default: Priority.MEDIUM })
  @Required()
  priority!: Priority;

  @Column({ name: 'done', type: 'boolean', default: false })
  done!: boolean;

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
