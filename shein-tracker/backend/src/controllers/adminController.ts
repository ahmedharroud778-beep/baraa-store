import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
import { ensureDefaultCities } from '../utils/seedCities';

export const adminController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const admin = await prisma.admin.findUnique({
        where: { email }
      });

      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { adminId: admin.id, email: admin.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          token,
          admin: {
            id: admin.id,
            email: admin.email
          }
        }
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  },

  async getSettings(req: Request, res: Response) {
    try {
      const settings = await prisma.settings.findFirst();

      if (!settings) {
        // Create default settings
        const defaultSettings = await prisma.settings.create({
          data: {
            libyanRate: 4.9,
            perKgFee: 15,
            itemWeights: {
              pants: 0.7,
              shirt: 0.3,
              dress: 0.5,
              shoes: 1.0,
              jacket: 1.2,
              accessories: 0.2
            },
            cityFees: {
              tripoli: 15,
              benghazi: 20,
              misrata: 18,
              sebha: 25
            }
          }
        });

        return res.json({
          success: true,
          data: defaultSettings
        });
      }

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  },

  async updateSettings(req: Request, res: Response) {
    try {
      const { libyanRate, perKgFee, itemWeights, cityFees } = req.body;

      const settings = await prisma.settings.findFirst();

      if (!settings) {
        const newSettings = await prisma.settings.create({
          data: {
            libyanRate: libyanRate || 4.9,
            perKgFee: perKgFee || 15,
            itemWeights: itemWeights || {},
            cityFees: cityFees || {}
          }
        });

        return res.json({
          success: true,
          data: newSettings
        });
      }

      const updatedSettings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          libyanRate: libyanRate !== undefined ? libyanRate : settings.libyanRate,
          perKgFee: perKgFee !== undefined ? perKgFee : settings.perKgFee,
          itemWeights: itemWeights || settings.itemWeights,
          cityFees: cityFees || settings.cityFees
        }
      });

      res.json({
        success: true,
        data: updatedSettings
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  },

  async getAllOrders(req: Request, res: Response) {
    try {
      const { status, limit = 50, offset = 0 } = req.query;

      const where: any = {};
      if (status) {
        where.status = status as string;
      }

      const orders = await prisma.order.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' }
      });

      const total = await prisma.order.count({ where });

      res.json({
        success: true,
        data: {
          orders,
          total,
          limit: Number(limit),
          offset: Number(offset)
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  },

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const validStatuses = ['not_confirmed', 'shipping_to_libya', 'in_libya', 'delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const order = await prisma.order.update({
        where: { id: String(id) },
        data: { status }
      });

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  },

  async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.order.delete({ where: { id: String(id) } });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  },

  async getCities(req: Request, res: Response) {
    try {
      const cities = await ensureDefaultCities();
      res.json({ success: true, data: cities });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cities' });
    }
  },

  async addCity(req: Request, res: Response) {
    try {
      const { name_en, name_ar } = req.body;
      if (!name_en || !name_ar) return res.status(400).json({ error: 'name_en and name_ar are required' });
      const city = await prisma.city.create({ data: { nameEn: name_en, nameAr: name_ar } });
      
      const settings = await prisma.settings.findFirst();
      if (settings) {
        const currentFees = settings.cityFees as Record<string, number>;
        if (currentFees[name_en] === undefined) {
          currentFees[name_en] = 0;
          await prisma.settings.update({
            where: { id: settings.id },
            data: { cityFees: currentFees }
          });
        }
      }

      res.json({ success: true, data: city });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add city' });
    }
  },

  async deleteCity(req: Request, res: Response) {
    try {
      await prisma.city.delete({ where: { id: parseInt(req.params.id as string) } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete city' });
    }
  },

  async getClothingItems(req: Request, res: Response) {
    try {
      const items = await prisma.clothingItem.findMany({ include: { weights: true } });
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch clothing items' });
    }
  },

  async addClothingItem(req: Request, res: Response) {
    try {
      const { name_en, name_ar } = req.body;
      if (!name_en || !name_ar) return res.status(400).json({ error: 'name_en and name_ar are required' });
      const item = await prisma.clothingItem.create({ data: { nameEn: name_en, nameAr: name_ar } });

      const settings = await prisma.settings.findFirst();
      if (settings) {
        const currentWeights = settings.itemWeights as Record<string, number>;
        if (currentWeights[name_en] === undefined) {
          currentWeights[name_en] = 0;
          await prisma.settings.update({
            where: { id: settings.id },
            data: { itemWeights: currentWeights }
          });
        }
      }

      res.json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add clothing item' });
    }
  },

  async deleteClothingItem(req: Request, res: Response) {
    try {
      await prisma.clothingItem.delete({ where: { id: parseInt(req.params.id as string) } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete clothing item' });
    }
  },

  async addClothingWeight(req: Request, res: Response) {
    try {
      const { label_en, label_ar, weight_kg } = req.body;
      if (!label_en || !label_ar || typeof weight_kg !== 'number' || weight_kg <= 0) {
        return res.status(400).json({ error: 'Invalid weight data' });
      }
      const weight = await prisma.clothingWeight.create({
        data: {
          clothingItemId: parseInt(req.params.id as string),
          labelEn: label_en,
          labelAr: label_ar,
          weightKg: weight_kg
        }
      });
      res.json({ success: true, data: weight });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add clothing weight' });
    }
  },

  async deleteClothingWeight(req: Request, res: Response) {
    try {
      await prisma.clothingWeight.delete({ where: { id: parseInt(req.params.id as string) } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete clothing weight' });
    }
  }
};
