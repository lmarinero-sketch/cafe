import { Reward } from '../../types';

export const initialRewards: Reward[] = [
  {
    id: 'rew-001',
    name: 'Café Espresso o Americano Clásico',
    description: 'Canjeá un café de especialidad a elección recién tostado y molido en el momento.',
    pointsCost: 250, // Equivale a $2.500 en consumo
    category: 'Cafetería',
    isAvailable: true,
  },
  {
    id: 'rew-002',
    name: 'Capuchino Especial con Arte Latte',
    description: 'Capuchino cremoso con doble shot de espresso, leche texturizada y cacao belga.',
    pointsCost: 350, // Equivale a $3.500 en consumo
    category: 'Cafetería',
    isAvailable: true,
  },
  {
    id: 'rew-003',
    name: 'Porción de Torta Artesanal / Lemon Pie',
    description: 'Una porción individual a elección de nuestra vitrina de pastelería de autor.',
    pointsCost: 500, // Equivale a $5.000 en consumo
    category: 'Pastelería',
    isAvailable: true,
  },
  {
    id: 'rew-004',
    name: 'Voucher Descuento $5.000 en Cuenta Total',
    description: 'Cupón de crédito de $5.000 directo para descontar de cualquier consumo en salón o take away.',
    pointsCost: 500, // Paridad exacta: 500 pts = $5.000
    category: 'Descuentos',
    isAvailable: true,
  },
  {
    id: 'rew-005',
    name: 'Combo Merienda Hilos de Amor',
    description: '1 Café o Infusión grande + 2 Medialunas artesanales + 1 Vaso de jugo de naranja natural.',
    pointsCost: 800, // Equivale a $8.000 en consumo
    category: 'Combos',
    isAvailable: true,
  },
  {
    id: 'rew-006',
    name: 'Voucher Descuento $10.000 en la Mesa',
    description: 'Descuento directo de $10.000 en la cuenta final de tu mesa para disfrutar con amigos o familia.',
    pointsCost: 1000, // Paridad exacta: 1.000 pts = $10.000
    category: 'Descuentos',
    isAvailable: true,
  },
  {
    id: 'rew-007',
    name: 'Taza Térmica Edición Exclusiva Hilos de Amor',
    description: 'Taza de acero inoxidable doble capa 350ml con grabado láser del Club de Socios.',
    pointsCost: 1500, // Equivale a $15.000 en consumo
    category: 'Merchandising',
    isAvailable: true,
  },
];
