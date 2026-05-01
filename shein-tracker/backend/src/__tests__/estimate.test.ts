import request from 'supertest';
import app from '../app';

describe('Estimate API', () => {
  describe('POST /api/estimate/price', () => {
    it('should return 400 if cartUrl is missing', async () => {
      const response = await request(app)
        .post('/api/estimate/price')
        .send({ mode: 'price' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('cartUrl');
    });

    it('should return 400 if mode is missing', async () => {
      const response = await request(app)
        .post('/api/estimate/price')
        .send({ cartUrl: 'https://example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('mode');
    });

    it('should return 400 if mode is invalid', async () => {
      const response = await request(app)
        .post('/api/estimate/price')
        .send({ cartUrl: 'https://example.com', mode: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('mode');
    });
  });
});
