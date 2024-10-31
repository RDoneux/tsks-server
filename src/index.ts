import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import logger from './middleware/logger';
import actuatorController from './controllers/actuator.controller';
import { errorLog, infoLog } from './globals/logging-globals';
import { dataSource } from './globals/data-source';
import exampleController from './controllers/example.controller';
import boardController from './controllers/board.controller';
import boardColumnController from './controllers/board-column.controller';
import ticketController from './controllers/ticket.controller';
import authenticate from './middleware/authentication';
import authController from './controllers/auth.controller';
import cors from 'cors';

export const environment = process.env.NODE_ENV || 'development';
console.log(
  `starting server in ${environment} environment... if there is no further logging, ensure DEBUG=<project-name>:* is defined in environment variables`
);
infoLog('Starting server...');

export const application = express();
let PORT = process.env.PORT || 4000;
// if running in test environment, force to port 4001 to avoid conflicts with potentially running instances
if (environment === 'test') PORT = 4001;

// middleware
application.use(
  cors({
    origin: [
      'http://localhost:5173',
      /^http:\/\/.*:\d+$/, // Allows any subdomain or host with port 5173
    ],
    methods: '*',
    credentials: true,
  })
);
application.use(express.json());
application.use(logger);
application.use('/auth', authController);

// turn authentication off for testing
if (environment !== 'test') {
  application.use(authenticate);
}

// controllers
application.use(actuatorController);
application.use(exampleController);
application.use('/boards', boardController);
application.use('/columns', boardColumnController);
application.use('/tickets', ticketController);

// root endpoints
application.use((request: Request, response: Response) => {
  response.status(404).json('endpoint not found, did you remember  to use the controller?');
});

// start server
/* eslint-disable @typescript-eslint/no-unused-expressions */
export const server = application.listen(PORT, (error?: Error) => {
  error
    ? errorLog(error)
    : infoLog(`Server launched successfully, listening at: http://localhost:${PORT}`);
});

// test environment will handle dataSource connection, no need to establish it in server
if (environment !== 'test') {
  // connect to database
  dataSource
    .initialize()
    .then(() => {
      infoLog('Database initalised successfully');
    })
    .catch((error: Error) => {
      errorLog(`There was an error initalising database: ${error}`);
    });
}
