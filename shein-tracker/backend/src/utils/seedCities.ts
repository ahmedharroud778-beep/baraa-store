import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function ensureDefaultCities() {
  let cities = await prisma.city.findMany();
  if (cities.length === 0) {
    const defaultCities = [
      { nameEn: 'Tripoli', nameAr: 'طرابلس' },
      { nameEn: 'Benghazi', nameAr: 'بنغازي' },
      { nameEn: 'Misrata', nameAr: 'مصراتة' },
      { nameEn: 'Sebha', nameAr: 'سبها' },
      { nameEn: 'Zawiya', nameAr: 'الزاوية' },
      { nameEn: 'Beida', nameAr: 'البيضاء' },
      { nameEn: 'Khoms', nameAr: 'الخمس' },
      { nameEn: 'Zliten', nameAr: 'زليتن' }
    ];
    await prisma.city.createMany({ data: defaultCities });
    cities = await prisma.city.findMany();
    
    const settings = await prisma.settings.findFirst();
    if (settings) {
      const currentFees = settings.cityFees as Record<string, number>;
      let updated = false;
      for (const city of defaultCities) {
        if (currentFees[city.nameEn] === undefined && currentFees[city.nameEn.toLowerCase()] === undefined) {
          currentFees[city.nameEn] = 0;
          updated = true;
        }
      }
      if (updated) {
        await prisma.settings.update({
          where: { id: settings.id },
          data: { cityFees: currentFees }
        });
      }
    }
  }
  return cities;
}
