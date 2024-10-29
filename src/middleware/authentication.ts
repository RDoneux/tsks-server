import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export default async function authenticate(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authorisationHeader = request.headers['authorization'];
  const token =
    authorisationHeader && authorisationHeader.startsWith('Bearer ')
      ? authorisationHeader.split(' ')[1]
      : null;
  const keycloakUrl = process.env.KEYCLOAK_URL;

  if (!token) {
    response.sendStatus(403);
    return;
  }

  try {
    const {
      data: { keys },
    } = await axios.get(`${keycloakUrl}/realms/tasks/protocol/openid-connect/certs`);
    const publicKey = keys[0].x5c[0];

    jwt.verify(token, `-----BEGIN CERTIFICATE-----\n${publicKey}\n-----END CERTIFICATE-----`, {
      algorithms: ['RS256'],
    });
    next();
  } catch (error) {
    response.status(403).json(error);
  }
}
