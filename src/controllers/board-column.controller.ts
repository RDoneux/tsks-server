import { Request, Response, Router } from 'express';
import BoardColumn from '../entities/board-columns/BoardColumn.entity';
import { BoardColumnRepository } from '../repositories/board-column.repository';
import { validateRequiredFields } from '../services/validation.service';
import { DeleteResult, UpdateResult } from 'typeorm';

const boardColumnController = Router();

boardColumnController.get('/', getAllColumns);
boardColumnController.get('/:id', getColumnById);
boardColumnController.get('/tickets/:id', getColumnTickets);
boardColumnController.post('/', createColumn);
boardColumnController.put('/:id', updateColumn);
boardColumnController.delete('/:id', deleteColumn);

async function getAllColumns(request: Request, response: Response) {
  try {
    const results: BoardColumn[] = await BoardColumnRepository.find();
    response.status(200).json(results);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getColumnById(request: Request, response: Response) {
  try {
    const id: string = request.params['id'];
    const result: BoardColumn | null = await BoardColumnRepository.findOne({ where: { id } });
    if (!result) {
      response.status(404).json(`Column with id '${id}' not found`);
      return;
    }
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getColumnTickets(request: Request, response: Response) {
  try {
    const id: string = request.params['id'];
    const result: BoardColumn | null = await BoardColumnRepository.findOne({
      where: { id },
      relations: ['tickets'],
    });

    if (!result) {
      response.status(404).json(`Column with id '${id}' not found`);
      return;
    }

    response.status(200).json(result);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function createColumn(request: Request, response: Response) {
  try {
    const missingFields = validateRequiredFields(BoardColumn, request.body);
    if (missingFields) {
      response
        .status(400)
        .json(`Creating a Column requires the following mandatory fields: ${missingFields}`);
      return;
    }
    const columnToBeSaved: BoardColumn = request.body;
    const savedColumn = await BoardColumnRepository.save(columnToBeSaved);

    response.status(201).json(savedColumn);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function updateColumn(request: Request, response: Response) {
  try {
    const id: string = request.params['id'];
    if (!Object.keys(request.body).length) {
      response.status(400).json('Please specify a request body');
      return;
    }

    const updateResult: UpdateResult = await BoardColumnRepository.update(id, request?.body);

    if (!updateResult.affected) {
      response.status(404).json(`Column with id '${id}' not found`);
      return;
    }

    const updatedColumn: BoardColumn | null = await BoardColumnRepository.findOne({
      where: { id },
    });
    response.status(200).json({ updateResult, updatedColumn });
  } catch (error) {
    response.status(500).json(error);
  }
}

async function deleteColumn(request: Request, response: Response) {
  try {
    const id: string = request.params['id'];
    const deleteResult: DeleteResult = await BoardColumnRepository.delete(id);

    if (!deleteResult.affected) {
      response.status(404).json(`Column with id '${id}' not found`);
      return;
    }

    response.sendStatus(204);
  } catch (error) {
    response.status(500).json(error);
  }
}
export default boardColumnController;
