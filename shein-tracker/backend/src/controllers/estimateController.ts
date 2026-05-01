import { Request, Response } from 'express';
import { calculationService } from '../services/calculationService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const estimateController = {
  async getConfig(req: Request, res: Response) {
    try {
      const settings = await prisma.settings.findFirst();
      const cities = await prisma.city.findMany();
      const clothingItems = await prisma.clothingItem.findMany({ include: { weights: true } });
      
      res.json({
        success: true,
        data: {
          settings,
          cities,
          clothingItems
        }
      });
    } catch (error) {
      console.error('Error fetching config:', error);
      res.status(500).json({ error: 'Failed to fetch config' });
    }
  },

  async calculatePrice(req: Request, res: Response) {
    try {
      const { cartUrl, mode, city, cartTotal, totalWeight } = req.body;

      if (!cartTotal) {
        return res.status(400).json({ error: 'cartTotal is required' });
      }

      if (mode !== 'price' && mode !== 'weight') {
        return res.status(400).json({ error: 'mode must be either "price" or "weight"' });
      }

      // Queue scraping job or use manual total
      const estimate = await calculationService.calculateEstimate(cartUrl || '', mode, city, cartTotal, totalWeight);

      res.json({
        success: true,
        data: estimate
      });
    } catch (error) {
      console.error('Error calculating estimate:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to calculate estimate';
      res.status(500).json({ error: message });
    }
  }
};
