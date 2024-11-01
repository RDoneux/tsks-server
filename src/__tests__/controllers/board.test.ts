import request, { Response } from 'supertest';
import { application, server } from '../..';
import { dataSource } from '../../globals/data-source';
import { prepareDataSource, teardownDataSource } from '../../globals/test-utils';
import Board from '../../entities/board/board.entity';
import { BoardRepository } from '../../repositories/board.repository';
import BoardColumn from '../../entities/board-columns/BoardColumn.entity';

describe('Board', () => {
  describe('Get all boards', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 200 OK with empty array if no boards found', async () => {
      const response: Response = await request(application).get('/boards');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
    });

    it('should return 200 OK with boards if any are in', async () => {
      const testBoard: Board = new Board();
      testBoard.boardName = 'test-board';

      const savedBoard: Board = await BoardRepository.save(testBoard);
      const response: Response = await request(application).get('/boards');

      expect(response.status).toEqual(200);
      const body: Board[] = response.body;
      expect(body.length).toBe(1);
      expect(body[0].boardName).toBe(savedBoard.boardName);
      expect(body[0].id).toBe(savedBoard.id);
    });

    it('should return 200 OK with boards and column count', async () => {
      const testColumn: BoardColumn = new BoardColumn();
      testColumn.columnName = 'test-column';

      const testBoard: Board = new Board();
      testBoard.boardName = 'test-board';
      testBoard.columns = [testColumn];

      const savedBoard: Board = await BoardRepository.save(testBoard);
      const response: Response = await request(application).get('/boards');

      expect(response.status).toEqual(200);
      const body: Board[] = response.body;
      expect(body.length).toBe(1);
      expect(body[0].boardName).toBe(savedBoard.boardName);
      expect(body[0].id).toBe(savedBoard.id);
      expect(body[0].columnCount).toBe(1);
    });
  });

  describe('Get boards by id', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 404 NOT FOUND if board is not in database', async () => {
      const id: string = 'c00fcc01-4f4e-4c1a-ba34-405f0e26f99a';
      const response: Response = await request(application).get(`/boards/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        "Board with id 'c00fcc01-4f4e-4c1a-ba34-405f0e26f99a' not found"
      );
    });

    it('should return 200 OK with requested result', async () => {
      const testBoard: Board = new Board();
      testBoard.boardName = 'test-board';
      const savedBoard: Board = await BoardRepository.save(testBoard);

      const response: Response = await request(application).get(`/boards/${savedBoard.id}`);

      expect(response.status).toBe(200);
      const returnedBoard: Board = response.body;
      expect(returnedBoard.id).toEqual(savedBoard.id);
      expect(returnedBoard.boardName).toEqual(savedBoard.boardName);
    });
  });

  describe('get board columns', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 404 NOT FOUND if board is not in database', async () => {
      const id: string = '256e492a-34b0-4f54-8d7d-f7a37ea183e1';
      const response: Response = await request(application).get(`/boards/columns/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(`Board with id '${id}' not found`);
    });

    it('should return 200 OK with empty column array if there are no related columns', async () => {
      const testBoard: Board = new Board();
      testBoard.boardName = 'test-board';

      const savedBoard: Board = await BoardRepository.save(testBoard);
      const response: Response = await request(application).get(`/boards/columns/${savedBoard.id}`);

      expect(response.status).toBe(200);
      expect(response.body.columns.length).toBe(0);
    });

    it('should return 200 OK with column array if there are related columns', async () => {
      const relatedColumn: BoardColumn = new BoardColumn();
      relatedColumn.columnName = 'test-column-name';

      const testBoard: Board = new Board();
      testBoard.boardName = 'test-board';
      testBoard.columns = [relatedColumn];

      const savedBoard: Board = await BoardRepository.save(testBoard);

      const response: Response = await request(application).get(`/boards/columns/${savedBoard.id}`);

      expect(response.status).toBe(200);
      expect(response.body.columns.length).toBe(1);
      expect(response.body.columns[0].columnName).toEqual(relatedColumn.columnName);
    });
  });

  describe('Create board', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 400 MALFORMED REQUEST if request body is missing required fields', async () => {
      const response: Response = await request(application)
        .post('/boards')
        .send({ updatedAt: new Date() });
      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        'Creating a Board requires the following mandatory fields: boardName'
      );
    });

    it('should return 400 MALFORMED REQUEST if request is missing a body', async () => {
      const response: Response = await request(application).post('/boards');

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        'Creating a Board requires the following mandatory fields: boardName'
      );
    });

    it('should return 201 CREATED with created board if created successfully', async () => {
      const response: Response = await request(application)
        .post('/boards')
        .send({ boardName: 'test-board' });
      expect(response.status).toBe(201);
      expect(response.body.boardName).toEqual('test-board');
    });

    it('should create board in database', async () => {
      const response: Response = await request(application)
        .post('/boards')
        .send({ boardName: 'test-board' });
      expect(response.status).toBe(201);
      const databaseContents: Board[] = await BoardRepository.find({
        where: { id: response.body.id },
      });
      expect(databaseContents.length).toBe(1);
      expect(databaseContents[0].boardName).toEqual('test-board');
    });
  });

  describe('Update baord', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 404 NOT FOUND if board does not exist', async () => {
      const id: string = 'f2acc4b8-f9d8-481f-bc2d-547d4f88c7d8';
      const response: Response = await request(application)
        .put(`/boards/${id}`)
        .send({ boardName: 'updated-board-name' });
      expect(response.status).toBe(404);
      expect(response.body).toEqual(`Board with id '${id}' not found`);
    });

    it('should return 400 MALFORMED REQUEST if no request body is sent', async () => {
      const id: string = '4b6c0b48-7a48-4db6-96dc-47bc21429156';
      const response: Response = await request(application).put(`/boards/${id}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(`Please specify a request body`);
    });

    it('should return 200 OK with updated board values if board updated successfully', async () => {
      const testBoard: Board = new Board();
      testBoard.boardName = 'origional-board-name';

      const savedBoard: Board = await BoardRepository.save(testBoard);

      const response: Response = await request(application)
        .put(`/boards/${savedBoard.id}`)
        .send({ boardName: 'updated-board-name' });
      expect(response.status).toEqual(200);
      expect(response.body.updateResult.affected).toBe(1);
      expect(response.body.updatedBoard.boardName).not.toEqual('origional-board-name');
      expect(response.body.updatedBoard.boardName).toEqual('updated-board-name');
    });
  });

  describe('Delete board', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 404 NOT FOUND if board does not exist', async () => {
      const id: string = '167c40b1-144c-4100-97e3-67ad13437656';
      const response: Response = await request(application).delete(`/boards/${id}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual(`Board with id '${id}' not found`);
    });

    it('should return 204 NO CONTENT if board deleted successfully', async () => {
      const testBoard: Board = new Board();
      testBoard.boardName = 'board-name';

      const savedBoard: Board = await BoardRepository.save(testBoard);
      const response: Response = await request(application).delete(`/boards/${savedBoard.id}`);

      expect(response.status).toBe(204);
    });

    it('should delete board from database', async () => {
      const testBoard: Board = new Board();
      testBoard.boardName = 'board-name';

      const savedBoard: Board = await BoardRepository.save(testBoard);
      const response: Response = await request(application).delete(`/boards/${savedBoard.id}`);

      expect(response.status).toBe(204);
      const databaseContents: Board[] = await BoardRepository.find({
        where: { id: savedBoard.id },
      });
      expect(databaseContents.length).toBe(0);
    });
  });
});
