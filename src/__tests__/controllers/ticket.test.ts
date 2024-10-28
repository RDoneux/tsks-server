import { application, server } from '../..';
import BoardColumn from '../../entities/board-columns/BoardColumn.entity';
import Ticket from '../../entities/ticket/ticket.entity';
import { dataSource } from '../../globals/data-source';
import { prepareDataSource, teardownDataSource } from '../../globals/test-utils';
import { BoardColumnRepository } from '../../repositories/board-column.repository';
import { TicketRepository } from '../../repositories/ticket.repository';
import request, { Response } from 'supertest';

describe('Ticket', () => {
  describe('get all tickets', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 200 OK with empty array if there are no results found', async () => {
      const response: Response = await request(application).get('/tickets');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 200 OK with results if there are results', async () => {
      const testTicket: Ticket = new Ticket();
      testTicket.ticketName = 'test-ticket-name';
      testTicket.description = 'test-ticket-description';
      testTicket.priority = 'critical';

      const savedColumn: Ticket = await TicketRepository.save(testTicket);

      const response: Response = await request(application).get('/tickets');
      expect(response.status).toBe(200);
      const responseBody = response.body;
      expect(responseBody.length).toBe(1);
      expect(responseBody[0].ticketName).toEqual(savedColumn.ticketName);
      expect(responseBody[0].description).toEqual(savedColumn.description);
      expect(responseBody[0].priority).toEqual(savedColumn.priority);
      expect(responseBody[0].id).toEqual(savedColumn.id);
    });
  });

  describe('get ticket by id', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 404 NOT FOUND if ticket does not exist', async () => {
      const id: string = '3275b578-1b4b-454b-8d0e-d539e69cfafa';
      const response: Response = await request(application).get(`/tickets/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(`Ticket with id '${id}' not found`);
    });

    it('should return 200 OK with result if found', async () => {
      const testTicket: Ticket = new Ticket();
      testTicket.ticketName = 'test-ticket-name';
      testTicket.priority = 'critical';

      const savedTicket: Ticket = await TicketRepository.save(testTicket);
      const response: Response = await request(application).get(`/tickets/${savedTicket.id}`);

      expect(response.status).toBe(200);
      const result: Ticket = response.body;
      expect(result.id).toEqual(savedTicket.id);
      expect(result.ticketName).toEqual(savedTicket.ticketName);
      expect(result.priority).toEqual(savedTicket.priority);
    });
  });

  describe('create ticket', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 400 MALFORMED REQUEST if request is missing mandatory fields', async () => {
      const response: Response = await request(application).post('/tickets').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        `Creating a Ticket requires the following mandatory fields: ticketName, priority`
      );
    });

    it('should return 400 MALFORMED REQUEST if request is missing a body', async () => {
      const response: Response = await request(application).post('/tickets');

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        'Creating a Ticket requires the following mandatory fields: ticketName, priority'
      );
    });

    it('should return 201 CREATED if ticket is created successfully', async () => {
      const ticketToSave: Ticket = new Ticket();
      ticketToSave.ticketName = 'test-ticket-name';
      ticketToSave.priority = 'critical';

      const response: Response = await request(application).post('/tickets').send(ticketToSave);

      expect(response.status).toEqual(201);
      expect(response.body.ticketName).toEqual(ticketToSave.ticketName);
      expect(response.body.priority).toEqual(ticketToSave.priority);
    });

    it('should save resource in database', async () => {
      const ticketToSave: Ticket = new Ticket();
      ticketToSave.ticketName = 'test-ticket-name';
      ticketToSave.priority = 'critical';

      const response: Response = await request(application).post('/tickets').send(ticketToSave);

      expect(response.status).toEqual(201);

      const savedResponse: Ticket | null = await TicketRepository.findOne({
        where: { id: response.body.id },
      });

      expect(savedResponse).toBeDefined();
      expect(savedResponse?.ticketName).toEqual(ticketToSave.ticketName);
      expect(savedResponse?.priority).toEqual(ticketToSave.priority);
    });
  });

  describe('update ticket', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 404 NOT FOUND if ticket is not found', async () => {
      const id: string = '28d01aef-5161-4e09-9563-fb3e34677b2d';
      const response: Response = await request(application)
        .put(`/tickets/${id}`)
        .send({ ticketName: 'test-ticket-name' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual(`Ticket with id '${id}' not found`);
    });

    it('should return 400 MALFORMED REQUEST if no request body is sent', async () => {
      const id: string = '4b6c0b48-7a48-4db6-96dc-47bc21429156';
      const response: Response = await request(application).put(`/tickets/${id}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(`Please specify a request body`);
    });

    it('should return 200 OK with updated result and ticket information', async () => {
      const ticketToUpdate: Ticket = new Ticket();
      ticketToUpdate.ticketName = 'origional-ticket-name';

      const savedTicket: Ticket = await TicketRepository.save(ticketToUpdate);

      const response: Response = await request(application)
        .put(`/tickets/${savedTicket.id}`)
        .send({ ticketName: 'updated-ticket-name' });

      expect(response.status).toBe(200);
      expect(response.body.updateResult.affected).toBe(1);
      expect(response.body.updatedTicket.id).toEqual(savedTicket.id);
      expect(response.body.updatedTicket.ticketName).toEqual('updated-ticket-name');
    });

    it('should update value in database', async () => {
      const ticketToUpdate: Ticket = new Ticket();
      ticketToUpdate.ticketName = 'origional-ticket-name';

      const savedTicket: Ticket = await TicketRepository.save(ticketToUpdate);

      const response: Response = await request(application)
        .put(`/tickets/${savedTicket.id}`)
        .send({ ticketName: 'updated-ticket-name' });

      expect(response.status).toBe(200);

      const ticketInDatabase: Ticket | null = await TicketRepository.findOne({
        where: { id: savedTicket.id },
      });
      expect(ticketInDatabase).toBeDefined();
      expect(ticketInDatabase?.ticketName).toEqual('updated-ticket-name');
    });
  });

  describe('move ticket', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 400 MALFORMED REQUEST if ticket id is not supplied', async () => {
      const response: Response = await request(application)
        .put('/tickets/move')
        .send({ destinationColumnId: '171c8586-0ff9-4a1e-a00a-83aa0a47682c' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual('ticketId is required');
    });

    it('should return 400 MALFORMED REQUEST if destinationColumnId is not supplied', async () => {
      const response: Response = await request(application)
        .put('/tickets/move')
        .send({ ticketId: '976f8599-1bc6-498b-ab06-edee768af533' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual('destinationColumnId is required');
    });

    it('should return 404 NOT FOUND if ticket is not within database', async () => {
      const ticketId: string = 'b3c77ff7-aa51-4b46-a890-1e131083260f';

      const response: Response = await request(application)
        .put('/tickets/move')
        .send({ destinationColumnId: 'd1822531-15a0-441f-a957-b36cce563c14', ticketId });
      expect(response.status).toBe(404);
      expect(response.body).toEqual(`Ticket with id '${ticketId}' not found`);
    });

    it('should return 404 NOT FOUND if column is not within database', async () => {
      const ticketToSave: Ticket = new Ticket();
      ticketToSave.ticketName = 'test-ticket-name';
      ticketToSave.priority = 'critical';

      const savedTicket: Ticket = await TicketRepository.save(ticketToSave);
      const ticketId: string = savedTicket.id;
      const destinationColumnId: string = '048a1ad8-2920-4771-82f3-345545f59711';

      const response: Response = await request(application)
        .put('/tickets/move')
        .send({ destinationColumnId, ticketId });

      expect(response.status).toBe(404);
      expect(response.body).toEqual(`Column with id '${destinationColumnId}' not found`);
    });

    it('should save ticket to new column', async () => {
      const ticketToSave: Ticket = new Ticket();
      ticketToSave.ticketName = 'test-ticket-name';
      ticketToSave.priority = 'critical';

      const savedTicket: Ticket = await TicketRepository.save(ticketToSave);
      const ticketId: string = savedTicket.id;

      const origionalColumnToSave: BoardColumn = new BoardColumn();
      origionalColumnToSave.columnName = 'test-origional-column-name';
      origionalColumnToSave.tickets = [savedTicket];

      await BoardColumnRepository.save(origionalColumnToSave);

      const destinationColumnToSave: BoardColumn = new BoardColumn();
      destinationColumnToSave.columnName = 'test-destination-column-name';

      const savedDestinationColumn: BoardColumn =
        await BoardColumnRepository.save(destinationColumnToSave);
      const destinationColumnId: string = savedDestinationColumn.id;

      const response: Response = await request(application)
        .put('/tickets/move')
        .send({ destinationColumnId, ticketId });

      expect(response.status).toBe(200);
      expect(response.body.column.id).toEqual(destinationColumnId);
    });
  });

  describe('delete ticket', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 404 if ticket is not found', async () => {
      const id: string = '6323c90d-6bd2-4333-9c8d-a0d539789067';
      const response: Response = await request(application).delete(`/tickets/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(`Ticket with id '${id}' not found`);
    });

    it('should return 204 NO CONTENT if request is deleted successfully', async () => {
      const ticketToDelete: Ticket = new Ticket();
      ticketToDelete.ticketName = 'ticket-name';
      ticketToDelete.priority = 'critical';

      const savedTicket: Ticket = await TicketRepository.save(ticketToDelete);
      const response: Response = await request(application).delete(`/tickets/${savedTicket.id}`);

      expect(response.status).toBe(204);
    });

    it('should delete ticket from database', async () => {
      const ticketToDelete: Ticket = new Ticket();
      ticketToDelete.ticketName = 'ticket-name';
      ticketToDelete.priority = 'critical';

      const savedTicket: Ticket = await TicketRepository.save(ticketToDelete);
      const response: Response = await request(application).delete(`/tickets/${savedTicket.id}`);

      expect(response.status).toBe(204);
      const ticketInDatabase: Ticket | null = await TicketRepository.findOne({
        where: { id: savedTicket.id },
      });
      expect(ticketInDatabase).toBeFalsy();
    });
  });
});
