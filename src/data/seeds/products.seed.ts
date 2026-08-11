import { Product } from '../../types';

export const initialProducts: Product[] = [
  // ==========================================
  // CAFETERÍA
  // ==========================================
  {
    id: 'prod-cafe-chico',
    name: 'Café (Chico)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Café clásico tamaño chico.',
    price: 3300,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: true,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-cafe-med',
    name: 'Café (Mediano)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Café clásico tamaño mediano.',
    price: 3800,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-cafe-gde',
    name: 'Café (Grande)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Café clásico tamaño grande.',
    price: 4500,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-cafe-leche-chico',
    name: 'Café c/leche (Chico)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Café con leche tamaño chico.',
    price: 3900,
    image: '/products/cafe-con-leche.svg',
    isAvailable: true,
    isFeatured: true,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-cafe-leche-med',
    name: 'Café c/leche (Mediano)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Café con leche tamaño mediano.',
    price: 4400,
    image: '/products/cafe-con-leche.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-cafe-leche-gde',
    name: 'Café c/leche (Grande)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Café con leche tamaño grande.',
    price: 5100,
    image: '/products/cafe-con-leche.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-cafe-cond-chico',
    name: 'Café c/leche condensada (Chico)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Café con leche condensada tamaño chico.',
    price: 4200,
    image: '/products/cafe-con-leche.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-cafe-cond-med',
    name: 'Café c/leche condensada (Mediano)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Café con leche condensada tamaño mediano.',
    price: 4700,
    image: '/products/cafe-con-leche.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-cafe-cond-gde',
    name: 'Café c/leche condensada (Grande)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Café con leche condensada tamaño grande.',
    price: 5400,
    image: '/products/cafe-con-leche.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-cortado-chico',
    name: 'Cortado (Chico)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Cortado clásico tamaño chico.',
    price: 3500,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-cortado-med',
    name: 'Cortado (Mediano)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Cortado clásico tamaño mediano.',
    price: 4000,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-cortado-gde',
    name: 'Cortado (Grande)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Cortado clásico tamaño grande.',
    price: 4700,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-lagrima-chico',
    name: 'Lagrima (Chico)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Lágrima tamaño chico.',
    price: 3500,
    image: '/products/cafe-con-leche.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-lagrima-med',
    name: 'Lagrima (Mediano)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Lágrima tamaño mediano.',
    price: 4000,
    image: '/products/cafe-con-leche.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-lagrima-gde',
    name: 'Lagrima (Grande)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Lágrima tamaño grande.',
    price: 4700,
    image: '/products/cafe-con-leche.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-americano-chico',
    name: 'Americano (Chico)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Café americano tamaño chico.',
    price: 3300,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-americano-med',
    name: 'Americano (Mediano)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Café americano tamaño mediano.',
    price: 3800,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-americano-gde',
    name: 'Americano (Grande)',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Café americano tamaño grande.',
    price: 4500,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-espresso',
    name: 'Espresso',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Espresso clásico.',
    price: 3300,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-doble-espresso',
    name: 'Doble espresso',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Doble shot de espresso.',
    price: 4200,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-macchiato',
    name: 'Macchiato',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Doble espresso + leche 80ml.',
    price: 4800,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-flat-white',
    name: 'Flat White',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Doble espresso + leche 200ml.',
    price: 5200,
    image: '/products/cafe-con-leche.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-mocaccino',
    name: 'Mocaccino',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Espresso + chocolate 70% + leche 200ml.',
    price: 5500,
    image: '/products/capuchino.svg',
    isAvailable: true,
    isFeatured: true,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-capuchino',
    name: 'Capuchino',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Capuchino clásico espumoso.',
    price: 5500,
    image: '/products/capuchino.svg',
    isAvailable: true,
    isFeatured: true,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-submarino',
    name: 'Submarino',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Clásico submarino.',
    price: 5500,
    image: '/products/capuchino.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-chocolatada',
    name: 'Chocolatada',
    categoryId: 'cat-cafeteria',
    categoryName: 'Cafetería',
    description: 'Leche chocolatada.',
    price: 5000,
    image: '/products/capuchino.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },

  // ==========================================
  // BEBIDAS FRÍAS
  // ==========================================
  {
    id: 'prod-latte-frio',
    name: 'Latte Frío',
    categoryId: 'cat-bebidas-frias',
    categoryName: 'Bebidas Frías',
    description: 'Espresso + leche + hielo 260 ml.',
    price: 5500,
    image: '/products/jugo-naranja.svg',
    isAvailable: true,
    isFeatured: true,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-caramel-latte-frio',
    name: 'Caramel Latte Frío',
    categoryId: 'cat-bebidas-frias',
    categoryName: 'Bebidas Frías',
    description: 'Caramel + Espresso + leche + hielo 260 ml.',
    price: 5800,
    image: '/products/jugo-naranja.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-frapucchino',
    name: 'Frapucchino',
    categoryId: 'cat-bebidas-frias',
    categoryName: 'Bebidas Frías',
    description: 'Bebida fría tipo frapucchino.',
    price: 6000,
    image: '/products/jugo-naranja.svg',
    isAvailable: true,
    isFeatured: true,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-licuado-banana',
    name: 'Licuado (Banana)',
    categoryId: 'cat-bebidas-frias',
    categoryName: 'Bebidas Frías',
    description: 'Licuado fresco de banana.',
    price: 7000,
    image: '/products/jugo-naranja.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-licuado-durazno',
    name: 'Licuado (Durazno)',
    categoryId: 'cat-bebidas-frias',
    categoryName: 'Bebidas Frías',
    description: 'Licuado fresco de durazno.',
    price: 7000,
    image: '/products/jugo-naranja.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-licuado-frutilla',
    name: 'Licuado (Frutilla)',
    categoryId: 'cat-bebidas-frias',
    categoryName: 'Bebidas Frías',
    description: 'Licuado fresco de frutilla.',
    price: 7000,
    image: '/products/jugo-naranja.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-jugo-naranja',
    name: 'Jugo Naranja (vaso)',
    categoryId: 'cat-bebidas-frias',
    categoryName: 'Bebidas Frías',
    description: 'Jugo de naranja natural exprimido.',
    price: 3500,
    image: '/products/jugo-naranja.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-jugo-limonada',
    name: 'Limonada (vaso)',
    categoryId: 'cat-bebidas-frias',
    categoryName: 'Bebidas Frías',
    description: 'Limonada natural refrescante.',
    price: 3500,
    image: '/products/jugo-naranja.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-jugo-limonada-menta',
    name: 'Limonada menta jengibre (vaso)',
    categoryId: 'cat-bebidas-frias',
    categoryName: 'Bebidas Frías',
    description: 'Limonada con menta y un toque de jengibre.',
    price: 3700,
    image: '/products/jugo-naranja.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-yogurt',
    name: 'Yogurt con granola, frutas de estación',
    categoryId: 'cat-bebidas-frias',
    categoryName: 'Bebidas Frías',
    description: 'Bowl saludable de yogurt, granola y frutas frescas.',
    price: 10000,
    image: '/products/medialunas.svg',
    isAvailable: true,
    isFeatured: true,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-gaseosa',
    name: 'Gaseosa 500cc',
    categoryId: 'cat-bebidas-frias',
    categoryName: 'Bebidas Frías',
    description: 'Gaseosa línea Coca-Cola.',
    price: 3500,
    image: '/products/jugo-naranja.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-agua-gas',
    name: 'Agua con gas 500cc',
    categoryId: 'cat-bebidas-frias',
    categoryName: 'Bebidas Frías',
    description: 'Agua mineral con gas.',
    price: 2500,
    image: '/products/jugo-naranja.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },

  // ==========================================
  // PASTELERÍA INDIVIDUAL
  // ==========================================
  {
    id: 'prod-lemon-pie',
    name: 'Lemon pie',
    categoryId: 'cat-pasteleria-ind',
    categoryName: 'Pastelería Individual',
    description: 'Clásico lemon pie individual con merengue suizo.',
    price: 8000,
    image: '/products/cheesecake.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-naranja-choco',
    name: 'Naranja y chocolate',
    categoryId: 'cat-pasteleria-ind',
    categoryName: 'Pastelería Individual',
    description: 'Pastelería individual de naranja y chocolate.',
    price: 8000,
    image: '/products/cheesecake.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-crumble-manzana',
    name: 'Crumble de manzana',
    categoryId: 'cat-pasteleria-ind',
    categoryName: 'Pastelería Individual',
    description: 'Crumble de manzana con cubierta crocante.',
    price: 8000,
    image: '/products/cheesecake.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-pirinea',
    name: 'Pirinea',
    categoryId: 'cat-pasteleria-ind',
    categoryName: 'Pastelería Individual',
    description: 'Postre pirinea individual.',
    price: 8000,
    image: '/products/cheesecake.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-maicenita',
    name: 'Maicenita',
    categoryId: 'cat-pasteleria-ind',
    categoryName: 'Pastelería Individual',
    description: 'Clásico alfajor de maicena pequeño.',
    price: 4000,
    image: '/products/medialunas.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-alfajor',
    name: 'Alfajor (consultar variedad)',
    categoryId: 'cat-pasteleria-ind',
    categoryName: 'Pastelería Individual',
    description: 'Alfajor artesanal, variedades disponibles sujetas a stock.',
    price: 6000,
    image: '/products/medialunas.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },

  // ==========================================
  // PASTELERÍA (PORCIÓN)
  // ==========================================
  {
    id: 'prod-rogel',
    name: 'Rogel',
    categoryId: 'cat-pasteleria-porc',
    categoryName: 'Pastelería (Porción)',
    description: 'Porción de rogel clásico.',
    price: 10000,
    image: '/products/cheesecake.svg',
    isAvailable: true,
    isFeatured: true,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-semifrio-limon',
    name: 'Semifrío de limón',
    categoryId: 'cat-pasteleria-porc',
    categoryName: 'Pastelería (Porción)',
    description: 'Porción de torta semifrío de limón.',
    price: 10000,
    image: '/products/cheesecake.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-nube-nuez',
    name: 'Nube de nuez',
    categoryId: 'cat-pasteleria-porc',
    categoryName: 'Pastelería (Porción)',
    description: 'Porción de torta nube de nuez.',
    price: 10000,
    image: '/products/cheesecake.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-chaja-balcarce',
    name: 'Chaja o Balcarce',
    categoryId: 'cat-pasteleria-porc',
    categoryName: 'Pastelería (Porción)',
    description: 'Porción de tradicional Chaja o postre Balcarce.',
    price: 10000,
    image: '/products/cheesecake.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-cheesecake-frutos',
    name: 'Cheesecake de frutos rojos',
    categoryId: 'cat-pasteleria-porc',
    categoryName: 'Pastelería (Porción)',
    description: 'Porción de cheesecake con coulis de frutos rojos.',
    price: 12000,
    image: '/products/cheesecake.svg',
    isAvailable: true,
    isFeatured: true,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-selva-matilda',
    name: 'Selva negra o Matilda',
    categoryId: 'cat-pasteleria-porc',
    categoryName: 'Pastelería (Porción)',
    description: 'Porción de clásica Selva Negra o torta de chocolate Matilda.',
    price: 12000,
    image: '/products/cheesecake.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-carrot-cake',
    name: 'Carrot cake',
    categoryId: 'cat-pasteleria-porc',
    categoryName: 'Pastelería (Porción)',
    description: 'Porción de torta húmeda de zanahorias con frosting.',
    price: 12000,
    image: '/products/cheesecake.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },

  // ==========================================
  // PANADERÍA
  // ==========================================
  {
    id: 'prod-medialuna',
    name: 'Medialuna',
    categoryId: 'cat-panaderia',
    categoryName: 'Panadería',
    description: 'Medialuna de manteca pura horneada.',
    price: 2500,
    image: '/products/medialunas.svg',
    isAvailable: true,
    isFeatured: true,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-mafalda',
    name: 'Mafalda',
    categoryId: 'cat-panaderia',
    categoryName: 'Panadería',
    description: 'Mafalda clásica jamón y queso.',
    price: 3500,
    image: '/products/medialunas.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-tortita-semita',
    name: 'Tortita / Semita',
    categoryId: 'cat-panaderia',
    categoryName: 'Panadería',
    description: 'Tortita pinchada o raspada, o semita típica.',
    price: 2500,
    image: '/products/medialunas.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-tostadas-campo',
    name: 'Tostadas pan de campo x 2',
    categoryId: 'cat-panaderia',
    categoryName: 'Panadería',
    description: '(queso crema y mermelada)',
    price: 6000,
    image: '/products/tostado.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },

  // ==========================================
  // SALADOS
  // ==========================================
  {
    id: 'prod-chipa-4',
    name: 'Chipa x4',
    categoryId: 'cat-salados',
    categoryName: 'Salados',
    description: '4 unidades de delicioso pan de queso.',
    price: 4000,
    image: '/products/medialunas.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-sconns-3',
    name: 'Sconns x3',
    categoryId: 'cat-salados',
    categoryName: 'Salados',
    description: '3 unidades de scons salados.',
    price: 4500,
    image: '/products/medialunas.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-chipanguchito',
    name: 'Chipanguchito',
    categoryId: 'cat-salados',
    categoryName: 'Salados',
    description: '(encuentro perfecto entre el chipa artesanal y el tostado de siempre)',
    price: 9000,
    image: '/products/tostado.svg',
    isAvailable: true,
    isFeatured: true,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-ciabatta-crudo',
    name: 'Ciabatta crudo',
    categoryId: 'cat-salados',
    categoryName: 'Salados',
    description: 'Rúcula, jamón crudo, tomate cherry con aceite de oliva.',
    price: 12000,
    image: '/products/tostado.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-ciabatta-veggie',
    name: 'Ciabatta veggie',
    categoryId: 'cat-salados',
    categoryName: 'Salados',
    description: 'Palta, queso crema, huevo revuelto y semillas.',
    price: 10000,
    image: '/products/tostado.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },

  // ==========================================
  // TOSTONES
  // ==========================================
  {
    id: 'prod-toston-crudo',
    name: 'Tostón jamón crudo',
    categoryId: 'cat-tostones',
    categoryName: 'Tostones',
    description: 'Rúcula, jamón crudo, tomate cherry salteados en oliva.',
    price: 10000,
    image: '/products/tostado.svg',
    isAvailable: true,
    isFeatured: true,
    channels: ['salon', 'retiro']
  },
  {
    id: 'prod-toston-campo',
    name: 'Tostón de campo',
    categoryId: 'cat-tostones',
    categoryName: 'Tostones',
    description: 'Palta, queso crema, huevo revuelto.',
    price: 8000,
    image: '/products/tostado.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  },

  // ==========================================
  // ADICIONALES
  // ==========================================
  {
    id: 'prod-leche-almendra',
    name: 'Leche almendra (Adicional)',
    categoryId: 'cat-adicionales',
    categoryName: 'Adicionales',
    description: 'Cambio o extra de leche de almendras.',
    price: 2000,
    image: '/products/cafe-con-leche.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro']
  }
];
