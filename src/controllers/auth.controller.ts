import axios from 'axios';
import { Request, Response, Router } from 'express';

//TODO: errors if keycloak variables aren't set

const authController = Router();

const KEYCLOAK_URL = process.env.KEYCLOAK_URL ?? '';
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET ?? '';

const URL_ENCODED_HEADER = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

authController.get('/login', login);
authController.post('/refresh', refreshToken);

async function login(request: Request, response: Response) {
  try {
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      response.status(400).json('Authorisation header missing or incorrect');
      return;
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      response.status(400).json('Invalid Basic auth credentials');
      return;
    }

    const tokenResponse = await axios.post(
      `${KEYCLOAK_URL}/realms/tasks/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username,
        password,
      }).toString(),
      URL_ENCODED_HEADER
    );

    response.status(200).json(tokenResponse.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      response.status(error.status ?? 500).json(error);
      return;
    }
    response.status(500).json(error);
  }
}

async function refreshToken(request: Request, response: Response) {
  try {
    const refreshToken: string = request.body.refreshToken;

    if (!refreshToken) {
      response.status(400).json('refreshToken is required');
      return;
    }

    const tokenResponse = await axios.post(
      `${KEYCLOAK_URL}/realms/tasks/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
      }).toString(),
      URL_ENCODED_HEADER
    );

    response.status(200).json(tokenResponse.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      response.status(error.status ?? 500).json(error);
      return;
    }
    response.status(500).json(error);
  }
}

export default authController;
