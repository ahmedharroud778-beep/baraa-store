import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userController = {
  async updateUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { preferred_language } = req.body;

      let user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id,
            preferredLanguage: preferred_language
          }
        });
      } else {
        user = await prisma.user.update({
          where: { id },
          data: { preferredLanguage: preferred_language }
        });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
};
