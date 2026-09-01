import { Table } from '../../types';

export const initialTables: Table[] = [
  {
    id: 'tbl-1',
    number: 'Recepción 1',
    capacity: 2,
    sector: 'Recepción',
    status: 'disponible',
    qrCode: 'QR-REC-001',
  },
  {
    id: 'tbl-2',
    number: 'Sala 1 - Mesa 1',
    capacity: 4,
    sector: 'Sala 1',
    status: 'disponible',
    qrCode: 'QR-S1-001',
  },
  {
    id: 'tbl-3',
    number: 'Sala 2 - Mesa 1',
    capacity: 4,
    sector: 'Sala 2',
    status: 'disponible',
    qrCode: 'QR-S2-001',
  },
  {
    id: 'tbl-4',
    number: 'Patio Atrás 1',
    capacity: 4,
    sector: 'Patio de atrás',
    status: 'disponible',
    qrCode: 'QR-PA-001',
  },
  {
    id: 'tbl-5',
    number: 'Patio Lateral 1',
    capacity: 4,
    sector: 'Patio lateral',
    status: 'disponible',
    qrCode: 'QR-PL-001',
  },
  {
    id: 'tbl-6',
    number: 'Patio Delantero 1',
    capacity: 4,
    sector: 'Patio delantero',
    status: 'disponible',
    qrCode: 'QR-PD-001',
  },
];
