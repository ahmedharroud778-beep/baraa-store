import request from 'supertest';
import app from '../app';

describe('Order API', () => {
  describe('POST /api/orders', () => {
    it('should return 400 if orderId is missing', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ cartUrl: 'https://example.com', mode: 'price' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('orderId');
    });

    it('should return 400 if cartUrl is missing', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ orderId: '123', mode: 'price' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('cartUrl');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });
});
