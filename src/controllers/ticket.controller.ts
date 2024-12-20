import { Request, Response, Router } from 'express';
import { TicketRepository } from '../repositories/ticket.repository';
import Ticket from '../entities/ticket/ticket.entity';
import { validateRequiredFields } from '../services/validation.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import BoardColumn from '../entities/board-columns/BoardColumn.entity';
import { BoardColumnRepository } from '../repositories/board-column.repository';

const ticketController = Router();

ticketController.get('/', getAllTickets);
ticketController.get('/:id', getTicketById);
ticketController.post('/', createTicket);
ticketController.put('/move', moveTicket);
ticketController.put('/:id', updateTicket);
ticketController.delete('/:id', deleteTicket);

async function getAllTickets(request: Request, response: Response) {
  try {
    const results: Ticket[] = await TicketRepository.find();
    response.status(200).json(results);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getTicketById(request: Request, response: Response) {
  try {
    const id: string = request.params['id'];
    const result: Ticket | null = await TicketRepository.findOne({ where: { id } });

    if (!result) {
      response.status(404).json(`Ticket with id '${id}' not found`);
      return;
    }

    response.status(200).json(result);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function createTicket(request: Request, response: Response) {
  try {
    const missingFields = validateRequiredFields(Ticket, request.body);
    if (missingFields) {
      response
        .status(400)
        .json(`Creating a Ticket requires the following mandatory fields: ${missingFields}`);
      return;
    }
    const ticketToBeSaved: Ticket = request.body;
    const savedTicket = await TicketRepository.save(ticketToBeSaved);

    response.status(201).json(savedTicket);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function updateTicket(request: Request, response: Response) {
  try {
    const id: string = request.params['id'];
    if (!Object.keys(request.body).length) {
      response.status(400).json('Please specify a request body');
      return;
    }

    const updateResult: UpdateResult = await TicketRepository.update(id, request.body);

    if (!updateResult.affected) {
      response.status(404).json(`Ticket with id '${id}' not found`);
      return;
    }

    const updatedTicket: Ticket | null = await TicketRepository.findOne({ where: { id } });
    response.status(200).json({ updateResult, updatedTicket });
  } catch (error) {
    response.status(500).json(error);
  }
}

async function moveTicket(request: Request, response: Response) {
  try {
    const ticketId: string = request.body.ticketId;
    const destinationColumnId: string = request.body.destinationColumnId;
    if (!ticketId) {
      response.status(400).json('ticketId is required');
      return;
    }

    if (!destinationColumnId) {
      response.status(400).json(`destinationColumnId is required`);
      return;
    }

    const ticket: Ticket | null = await TicketRepository.findOne({
      where: { id: ticketId },
      relations: ['column'],
    });
    const destinationColumn: BoardColumn | null = await BoardColumnRepository.findOne({
      where: { id: destinationColumnId },
    });

    if (!ticket) {
      response.status(404).json(`Ticket with id '${ticketId}' not found`);
      return;
    }
    if (!destinationColumn) {
      response.status(404).json(`Column with id '${destinationColumnId}' not found`);
      return;
    }

    (ticket as Ticket).column = destinationColumn as BoardColumn;
    const savedTicket: Ticket = await TicketRepository.save(ticket);

    response.status(200).json(savedTicket);
  } catch (error) {
    console.log(error);
    response.status(500).json(error);
  }
}

async function deleteTicket(request: Request, response: Response) {
  try {
    const id: string = request.params['id'];
    const deleteResult: DeleteResult = await TicketRepository.delete(id);

    if (!deleteResult.affected) {
      response.status(404).json(`Ticket with id '${id}' not found`);
      return;
    }

    response.sendStatus(204);
  } catch (error) {
    response.status(500).json(error);
  }
}

export default ticketController;
