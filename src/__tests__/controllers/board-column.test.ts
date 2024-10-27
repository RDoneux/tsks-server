import request, { Response } from "supertest"
import { application, server } from "../.."
import { prepareDataSource, teardownDataSource } from "../../globals/test-utils";
import { dataSource } from "../../globals/data-source";
import BoardColumn from "../../entities/board-columns/BoardColumn.entity";
import { BoardColumnRepository } from "../../repositories/board-column.repository";

describe('Board Column', () => {

    describe('get all columns', () => {

        beforeEach(async () => {
            await prepareDataSource(dataSource);
        });

        afterAll(async () => {
            server.close();
            await teardownDataSource(dataSource);
        });

        it('should return 200 OK with empty array if there are no results found', async () => {
            const response: Response = await request(application).get('/columns');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        })

        it('should return 200 OK with results if there are results', async () => {
            const testColumn: BoardColumn = new BoardColumn();
            testColumn.columnName = 'test-column-name';

            const savedColumn: BoardColumn = await BoardColumnRepository.save(testColumn);

            const response: Response = await request(application).get('/columns');
            expect(response.status).toBe(200);
            const responseBody = response.body;
            expect(responseBody.length).toBe(1);
            expect(responseBody[0].columnName).toEqual(savedColumn.columnName);
            expect(responseBody[0].id).toEqual(savedColumn.id);
        })

    })

    describe('get column by id', () => {

        beforeEach(async () => {
            await prepareDataSource(dataSource);
        });

        afterAll(async () => {
            server.close();
            await teardownDataSource(dataSource);
        });

        it('should return 404 NOT FOUND if column does not exist', async () => {
            const id: string = 'd27c1c5e-cb79-4a54-a250-0fd285732b74';
            const response: Response = await request(application).get(`/columns/${id}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual(`Column with id '${id}' not found`);
        })

        it('should return 200 OK with result if found', async () => {
            const testColumn: BoardColumn = new BoardColumn();
            testColumn.columnName = 'test-column-name';

            const savedColumn: BoardColumn = await BoardColumnRepository.save(testColumn);
            const response: Response = await request(application).get(`/columns/${savedColumn.id}`);

            expect(response.status).toBe(200);
            const result: BoardColumn = response.body;
            expect(result.id).toEqual(savedColumn.id);
            expect(result.columnName).toEqual(savedColumn.columnName);
        })

    })

    describe('create column', () => {

        beforeEach(async () => {
            await prepareDataSource(dataSource);
        });

        afterAll(async () => {
            server.close();
            await teardownDataSource(dataSource);
        });

        it('should return 400 MALFORMED REQUEST if request is missing mandatory fields', async () => {

            const response: Response = await request(application).post('/columns').send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual('Creating a Column requires the following mandatory fields: columnName');
        })

        it('should return 201 CREATED if column is created successfully', async () => {
            const columnToSave: BoardColumn = new BoardColumn();
            columnToSave.columnName = 'test-column-name';

            const response: Response = await request(application).post('/columns').send(columnToSave);

            expect(response.status).toEqual(201);
            expect(response.body.columnName).toEqual(columnToSave.columnName);
        })

        it('should save resource in database', async () => {
            const columnToSave: BoardColumn = new BoardColumn();
            columnToSave.columnName = 'test-column-name';

            const response: Response = await request(application).post('/columns').send(columnToSave);

            expect(response.status).toEqual(201);

            const savedResponse: BoardColumn | null = await BoardColumnRepository.findOne({ where: { id: response.body.id } });

            expect(savedResponse).toBeDefined();
            expect(savedResponse?.columnName).toEqual(columnToSave.columnName);
        })

    })

    describe('update column', () => {

        beforeEach(async () => {
            await prepareDataSource(dataSource);
        });

        afterAll(async () => {
            server.close();
            await teardownDataSource(dataSource);
        });

        it('should return 404 NOT FOUND if column is not found', async () => {
            const id: string = '6707ee77-900c-4973-bac9-a90a02256d81';
            const response: Response = await request(application).put(`/columns/${id}`).send({ columnName: 'test-column-name' })

            expect(response.status).toBe(404);
            expect(response.body).toEqual(`Column with id '${id}' not found`);
        })

        it('should return 200 OK with update result and update column information', async () => {
            const columnToUpdate: BoardColumn = new BoardColumn();
            columnToUpdate.columnName = 'origional-column-name';

            const savedColumn: BoardColumn = await BoardColumnRepository.save(columnToUpdate);

            const response: Response = await request(application).put(`/columns/${savedColumn.id}`).send({ columnName: 'updated-column-name' });

            expect(response.status).toBe(200);
            expect(response.body.updateResult.affected).toBe(1);
            expect(response.body.updatedColumn.id).toEqual(savedColumn.id);
            expect(response.body.updatedColumn.columnName).toEqual('updated-column-name');
        })

        it('should update value in database', async () => {
            const columnToUpdate: BoardColumn = new BoardColumn();
            columnToUpdate.columnName = 'origional-column-name';

            const savedColumn: BoardColumn = await BoardColumnRepository.save(columnToUpdate);

            const response: Response = await request(application).put(`/columns/${savedColumn.id}`).send({ columnName: 'updated-column-name' });

            expect(response.status).toBe(200);
            const columnInDatabase: BoardColumn | null = await BoardColumnRepository.findOne({ where: { id: savedColumn.id } });
            expect(columnInDatabase).toBeDefined();
            expect(columnInDatabase?.columnName).toEqual('updated-column-name');
        })

    })

    describe('delete column', () => {

        beforeEach(async () => {
            await prepareDataSource(dataSource);
        });

        afterAll(async () => {
            server.close();
            await teardownDataSource(dataSource);
        });

        it('should return 404 if column is not found', async () => {
            const id: string = 'a6361ac6-2ea0-4f66-98ee-0eea80ff3e73';
            const response: Response = await request(application).delete(`/columns/${id}`).send({ columnName: 'test-column-name' })

            expect(response.status).toBe(404);
            expect(response.body).toEqual(`Column with id '${id}' not found`);
        })

        it('should return 204 NO CONTENT if request is deleted successfully', async () => {
            const columnToDelete: BoardColumn = new BoardColumn();
            columnToDelete.columnName = 'origional-column-name';

            const savedColumn: BoardColumn = await BoardColumnRepository.save(columnToDelete);
            const response: Response = await request(application).delete(`/columns/${savedColumn.id}`);

            expect(response.status).toBe(204);
        })

        it('should delete column from database', async () => {
            const columnToDelete: BoardColumn = new BoardColumn();
            columnToDelete.columnName = 'origional-column-name';

            const savedColumn: BoardColumn = await BoardColumnRepository.save(columnToDelete);
            const response: Response = await request(application).delete(`/columns/${savedColumn.id}`);

            expect(response.status).toBe(204);
            const columnInDatabase: BoardColumn | null = await BoardColumnRepository.findOne({ where: { id: savedColumn.id } });
            expect(columnInDatabase).toBeFalsy();
        })

    })

})