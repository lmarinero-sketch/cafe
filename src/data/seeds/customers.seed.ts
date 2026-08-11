import { Customer } from '../../types';

const names = [
  { first: 'Sofía', last: 'Martínez' },
  { first: 'Martín', last: 'Gómez' },
  { first: 'Lucía', last: 'Benítez' },
  { first: 'Gonzalo', last: 'Rossi' },
  { first: 'Camila', last: 'Torres' },
  { first: 'Mateo', last: 'Fernández' },
  { first: 'Valentina', last: 'López' },
  { first: 'Joaquín', last: 'Díaz' },
  { first: 'Isabella', last: 'Álvarez' },
  { first: 'Tomas', last: 'Romero' },
];

export const initialCustomers: Customer[] = Array.from({ length: 50 }, (_, i) => {
  const nameObj = names[i % names.length];
  const firstName = `${nameObj.first}${i >= 10 ? ` ${i + 1}` : ''}`;
  const lastName = nameObj.last;
  const purchases = 2 + ((i * 7) % 35);
  const totalSpent = purchases * (4500 + (i * 850) % 12000);
  const points = Math.round(totalSpent * 0.05);

  let level: Customer['level'] = 'Inicial';
  if (points > 3000) level = 'VIP';
  else if (points > 1500) level = 'Preferencial';
  else if (points > 500) level = 'Frecuente';

  return {
    id: `cli-${i + 1}`,
    firstName,
    lastName,
    phone: `+54911${50000000 + i * 1111}`,
    email: `${nameObj.first.toLowerCase()}.${nameObj.last.toLowerCase()}${i + 1}@gmail.com`,
    birthDate: `19${85 + (i % 20)}-0${(i % 9) + 1}-15`,
    registrationDate: '2025-11-10T10:00:00Z',
    purchaseCount: purchases,
    totalSpent,
    averageTicket: Math.round(totalSpent / purchases),
    lastPurchaseDate: new Date(Date.now() - (i % 15) * 86400000).toISOString(),
    points,
    level,
    usedPromotionsCount: (i % 4),
    marketingConsent: true,
    favoriteProduct: i % 2 === 0 ? 'Café c/leche (Mediano)' : 'Cheesecake de frutos rojos',
  };
});
