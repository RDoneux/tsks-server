import request, { Response } from 'supertest';
import { application, server } from '../..';
import { prepareDataSource, teardownDataSource } from '../../globals/test-utils';
import { dataSource } from '../../globals/data-source';
import axios from 'axios';

jest.mock('axios');

describe('auth controller', () => {
  describe('login', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 400 MALFORMED REQUEST if no authorisation header is sent', async () => {
      const response: Response = await request(application).get('/auth/login');
      expect(response.status).toBe(400);
      expect(response.body).toEqual('Authorisation header missing or incorrect');
    });

    it('should return 400 MALFORMED REQUEST if authorisation header does not start with "basic "', async () => {
      const response: Response = await request(application)
        .get('/auth/login')
        .set('authorization', `invalid-auth invalid-token`);
      expect(response.status).toBe(400);
      expect(response.body).toEqual('Authorisation header missing or incorrect');
    });

    it('should return 400 MALFORMED REQUEST if neither username or password are included in auth header', async () => {
      const response: Response = await request(application)
        .get('/auth/login')
        .set('authorization', 'Basic invalid-credentials');
      expect(response.status).toBe(400);
      expect(response.body).toEqual('Invalid Basic auth credentials');
    });

    it('should return 400 MALFORMED REQUEST if username if username is not included in auth header', async () => {
      const response: Response = await request(application)
        .get('/auth/login')
        .set('authorization', 'Basic OnBhc3N3b3Jk');
      expect(response.status).toBe(400);
      expect(response.body).toEqual('Invalid Basic auth credentials');
    });

    it('should return 400 MALFORMED REQUEST if password is not included in auth header', async () => {
      const response: Response = await request(application)
        .get('/auth/login')
        .set('authorization', 'Basic dXNlcm5hbWU6');
      expect(response.status).toBe(400);
      expect(response.body).toEqual('Invalid Basic auth credentials');
    });

    it('should call axios post with username and password', async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: { accessToken: 'newAccessToken', refreshToken: 'newRefreshToken' },
      });

      const response: Response = await request(application)
        .get('/auth/login')
        .set('authorization', 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=');

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/protocol/openid-connect/token'),
        expect.any(String),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });
  });

  describe('refresh token', () => {
    beforeEach(async () => {
      await prepareDataSource(dataSource);
    });

    afterAll(async () => {
      server.close();
      await teardownDataSource(dataSource);
    });

    it('should return 400 MALFORMED REQUEST if refreshToken is not supplied', async () => {
      const response: Response = await request(application).get('/auth/refresh');
      expect(response.status).toBe(400);
      expect(response.body).toEqual('refreshToken is required');
    });

    it('should call axios post with refresh token', async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: { accessToken: 'newAccessToken', refreshToken: 'newRefreshToken' },
      });

      const response: Response = await request(application)
        .get('/auth/refresh')
        .send({ refreshToken: 'test-refresh-token' });

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/protocol/openid-connect/token'),
        expect.any(String),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });
  });
});
