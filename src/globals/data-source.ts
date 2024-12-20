import dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { testDataSource } from './test-utils';
import { Example } from '../entities/example.entity';
import Board from '../entities/board/board.entity';
import BoardColumn from '../entities/board-columns/BoardColumn.entity';
import Ticket from '../entities/ticket/ticket.entity';

const _dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DS_HOST,
  port: Number.parseInt(process.env.DS_PORT || '3306'),
  username: process.env.DS_USERNAME,
  password: process.env.DS_PASSWORD,
  database: process.env.DS_DATABASE,
  // entities: ['*.entity.{js,ts}'],
  // entities: ["src/entities/*{.js,.ts}"],
  entities: [Example, Board, BoardColumn, Ticket],
  migrations: ['src/resources/migrations/*.ts'],
  logging: true,
  synchronize: false,
});

export const dataSource = process.env.NODE_ENV === 'test' ? testDataSource : _dataSource;
