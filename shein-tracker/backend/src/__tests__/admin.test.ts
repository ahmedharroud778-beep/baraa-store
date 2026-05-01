import request from 'supertest';
import app from '../app';

describe('Admin API', () => {
  describe('POST /api/admin/login', () => {
    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ email: 'admin@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('password');
    });
  });

  describe('GET /api/admin/settings', () => {
    it('should return settings', async () => {
      const response = await request(app)
        .get('/api/admin/settings');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});
