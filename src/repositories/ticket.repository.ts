import Ticket from '../entities/ticket/ticket.entity';
import { dataSource } from '../globals/data-source';

export const TicketRepository = dataSource.getRepository(Ticket);
