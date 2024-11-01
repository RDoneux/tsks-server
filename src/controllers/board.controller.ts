import { Request, Response, Router } from 'express';
import Board from '../entities/board/board.entity';
import { BoardRepository } from '../repositories/board.repository';
import { validateRequiredFields } from '../services/validation.service';
import { DeleteResult, UpdateResult } from 'typeorm';

const boardController = Router();

boardController.get('/', getAllBoards);
boardController.get('/:id', getBoardById);
boardController.get('/columns/:id', getBoardColumns);
boardController.post('/', createBoard);
boardController.put('/:id', updateBoard);
boardController.delete('/:id', deleteBoard);

async function getAllBoards(request: Request, response: Response) {
  try {
    const results: Board[] = await BoardRepository.createQueryBuilder('boards')
      .leftJoinAndSelect('boards.columns', 'columns')
      .loadRelationCountAndMap('boards.columnCount', 'boards.columns')
      .getMany();
    response.status(200).json(results);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getBoardById(request: Request, response: Response) {
  try {
    const id: string = request.params['id'];
    const result: Board | null = await BoardRepository.findOne({ where: { id } });
    if (!result) {
      response.status(404).json(`Board with id '${id}' not found`);
      return;
    }
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getBoardColumns(request: Request, response: Response) {
  try {
    const id: string = request.params['id'];
    const result: Board | null = await BoardRepository.findOne({
      where: { id },
      relations: ['columns'],
    });
    if (!result) {
      response.status(404).json(`Board with id '${id}' not found`);
      return;
    }
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function createBoard(request: Request, response: Response) {
  try {
    const missingFields = validateRequiredFields(Board, request.body);
    if (missingFields) {
      response
        .status(400)
        .json(`Creating a Board requires the following mandatory fields: ${missingFields}`);
      return;
    }

    const boardToBeSaved: Board = request.body;
    const savedBoard = await BoardRepository.save(boardToBeSaved);

    response.status(201).json(savedBoard);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function updateBoard(request: Request, response: Response) {
  try {
    const id: string = request.params['id'];
    if (!Object.keys(request.body).length) {
      response.status(400).json('Please specify a request body');
      return;
    }

    const updateResult: UpdateResult = await BoardRepository.update(id, request.body);

    if (!updateResult.affected) {
      response.status(404).json(`Board with id '${id}' not found`);
      return;
    }

    const updatedBoard: Board | null = await BoardRepository.findOne({ where: { id } });
    response.status(200).json({ updateResult, updatedBoard });
  } catch (error) {
    response.status(500).json(error);
  }
}

async function deleteBoard(request: Request, response: Response) {
  try {
    const id: string = request.params['id'];
    const deleteResult: DeleteResult = await BoardRepository.delete(id);

    if (!deleteResult.affected) {
      response.status(404).json(`Board with id '${id}' not found`);
      return;
    }

    response.sendStatus(204);
  } catch (error) {
    response.status(500).json(error);
  }
}

export default boardController;
