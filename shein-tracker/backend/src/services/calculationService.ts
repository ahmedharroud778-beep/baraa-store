import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const calculationService = {
  async calculateEstimate(cartUrl: string, mode: 'price' | 'weight', city?: string, providedCartTotal?: number, providedTotalWeight?: number) {
    // Get settings
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({
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
    }

    if (!providedCartTotal) {
      throw new Error('Cart total is required for calculation.');
    }

    const cartData = { totalPrice: providedCartTotal, currency: 'USD' };
    const cityFees = settings.cityFees as Record<string, number>;
    const deliveryFee = city ? cityFees[city] || 0 : 0;
    const convertedPrice = cartData.totalPrice * settings.libyanRate;
    const weightFee = mode === 'weight' && providedTotalWeight ? providedTotalWeight * settings.perKgFee : 0;
    const estimatedTotal = convertedPrice + deliveryFee + weightFee;

    return {
      orderId: 'temp-order-id',
      scrapeJobId: 'direct',
      mode,
      city,
      estimatedTotal,
      breakdown: {
        originalPrice: cartData.totalPrice,
        convertedPrice,
        weightFee,
        deliveryFee
      },
      status: 'calculated'
    };
  },

  calculatePriceMode(originalPrice: number, libyanRate: number, city: string, cityFees: any) {
    const convertedPrice = originalPrice * libyanRate;
    const deliveryFee = cityFees[city] || 0;
    const total = convertedPrice + deliveryFee;

    return {
      originalPrice,
      convertedPrice,
      deliveryFee,
      total
    };
  },

  calculateWeightMode(
    items: any[],
    itemWeights: any,
    perKgFee: number,
    libyanRate: number,
    city: string,
    cityFees: any
  ) {
    let totalWeight = 0;
    let originalPrice = 0;

    items.forEach((item) => {
      const weight = itemWeights[item.category] || 0.5;
      totalWeight += weight * item.quantity;
      originalPrice += item.price * item.quantity;
    });

    const weightFee = totalWeight * perKgFee;
    const convertedPrice = originalPrice * libyanRate;
    const deliveryFee = cityFees[city] || 0;
    const total = convertedPrice + weightFee + deliveryFee;

    return {
      originalPrice,
      convertedPrice,
      weightFee,
      deliveryFee,
      total,
      totalWeight
    };
  }
};
