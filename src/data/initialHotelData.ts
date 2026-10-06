import { Room, Product, Booking, Expense, Shift, Receptionist } from '../types/hotel';

// HABITACIONES 1 A 44: SEGÚN LA PLANILLA Y CATEGORÍAS OFICIALES DEL HOTEL
// REGLA: Dobles, Triples y Cuádruples tienen un solo precio único.
// Sencillas, Ejecutivas, Premium, Suites y Mini Suites tienen tarifa 1 y 2 personas.
export const INITIAL_ROOMS: Room[] = [
  // ----------------------------------------------------
  // BLOQUE 1: PLANTA BAJA (11 Habitaciones)
  // 1 (Desh), 2, 3, 33, 4, 5, 6, 7, 8, 17, 18
  // ----------------------------------------------------
  {
    id: '1',
    number: '1',
    floor: 'PLANTA BAJA',
    type: 'Sencilla',
    price: 35,
    price1Person: 23,
    price2Persons: 35,
    hasSinglePrice: false,
    status: 'V',
    cleaningStatus: 'POR LIMPIAR',
    notes: 'HABITACIÓN DESHABILITADA'
  },
  { id: '2', number: '2', floor: 'PLANTA BAJA', type: 'Sencilla', price: 35, price1Person: 23, price2Persons: 35, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '3', number: '3', floor: 'PLANTA BAJA', type: 'Triple', price: 55, price1Person: 55, price2Persons: 55, hasSinglePrice: true, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '33', number: '33', floor: 'PLANTA BAJA', type: 'Suite', price: 55, price1Person: 40, price2Persons: 55, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '4', number: '4', floor: 'PLANTA BAJA', type: 'Doble', price: 40, price1Person: 40, price2Persons: 40, hasSinglePrice: true, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '5', number: '5', floor: 'PLANTA BAJA', type: 'Sencilla', price: 35, price1Person: 23, price2Persons: 35, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '6', number: '6', floor: 'PLANTA BAJA', type: 'Sencilla', price: 35, price1Person: 23, price2Persons: 35, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '7', number: '7', floor: 'PLANTA BAJA', type: 'Ejecutiva', price: 38, price1Person: 25, price2Persons: 38, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '8', number: '8', floor: 'PLANTA BAJA', type: 'Sencilla', price: 35, price1Person: 23, price2Persons: 35, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '17', number: '17', floor: 'PLANTA BAJA', type: 'Sencilla', price: 35, price1Person: 23, price2Persons: 35, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '18', number: '18', floor: 'PLANTA BAJA', type: 'Sencilla', price: 35, price1Person: 23, price2Persons: 35, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },

  // ----------------------------------------------------
  // BLOQUE 2: PRIMER PISO (13 Habitaciones)
  // 9, 10, 11, 12, 13, 14, 15, 16, 27, 28, 29, 30, 31
  // ----------------------------------------------------
  { id: '9', number: '9', floor: 'PRIMER PISO', type: 'Ejecutiva', price: 38, price1Person: 25, price2Persons: 38, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '10', number: '10', floor: 'PRIMER PISO', type: 'Doble', price: 40, price1Person: 40, price2Persons: 40, hasSinglePrice: true, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '11', number: '11', floor: 'PRIMER PISO', type: 'Triple', price: 55, price1Person: 55, price2Persons: 55, hasSinglePrice: true, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '12', number: '12', floor: 'PRIMER PISO', type: 'Cuádruple', price: 65, price1Person: 65, price2Persons: 65, hasSinglePrice: true, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '13', number: '13', floor: 'PRIMER PISO', type: 'Sencilla', price: 35, price1Person: 23, price2Persons: 35, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '14', number: '14', floor: 'PRIMER PISO', type: 'Ejecutiva', price: 38, price1Person: 25, price2Persons: 38, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '15', number: '15', floor: 'PRIMER PISO', type: 'Sencilla', price: 35, price1Person: 23, price2Persons: 35, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '16', number: '16', floor: 'PRIMER PISO', type: 'Ejecutiva', price: 38, price1Person: 25, price2Persons: 38, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '27', number: '27', floor: 'PRIMER PISO', type: 'Premium', price: 40, price1Person: 30, price2Persons: 40, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '28', number: '28', floor: 'PRIMER PISO', type: 'Premium', price: 40, price1Person: 30, price2Persons: 40, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '29', number: '29', floor: 'PRIMER PISO', type: 'Ejecutiva', price: 38, price1Person: 25, price2Persons: 38, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '30', number: '30', floor: 'PRIMER PISO', type: 'Triple', price: 55, price1Person: 55, price2Persons: 55, hasSinglePrice: true, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '31', number: '31', floor: 'PRIMER PISO', type: 'Mini Suite', price: 50, price1Person: 35, price2Persons: 50, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },

  // ----------------------------------------------------
  // BLOQUE 3: SEGUNDO PISO (11 Habitaciones)
  // 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44
  // ----------------------------------------------------
  { id: '34', number: '34', floor: 'SEGUNDO PISO', type: 'Premium', price: 40, price1Person: 30, price2Persons: 40, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '35', number: '35', floor: 'SEGUNDO PISO', type: 'Premium', price: 40, price1Person: 30, price2Persons: 40, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '36', number: '36', floor: 'SEGUNDO PISO', type: 'Doble', price: 40, price1Person: 40, price2Persons: 40, hasSinglePrice: true, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '37', number: '37', floor: 'SEGUNDO PISO', type: 'Premium', price: 40, price1Person: 30, price2Persons: 40, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '38', number: '38', floor: 'SEGUNDO PISO', type: 'Doble', price: 40, price1Person: 40, price2Persons: 40, hasSinglePrice: true, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '39', number: '39', floor: 'SEGUNDO PISO', type: 'Premium', price: 40, price1Person: 30, price2Persons: 40, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '40', number: '40', floor: 'SEGUNDO PISO', type: 'Premium', price: 40, price1Person: 30, price2Persons: 40, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '41', number: '41', floor: 'SEGUNDO PISO', type: 'Premium', price: 40, price1Person: 30, price2Persons: 40, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '42', number: '42', floor: 'SEGUNDO PISO', type: 'Mini Suite', price: 50, price1Person: 35, price2Persons: 50, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '43', number: '43', floor: 'SEGUNDO PISO', type: 'Premium', price: 40, price1Person: 30, price2Persons: 40, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '44', number: '44', floor: 'SEGUNDO PISO', type: 'Mini Suite', price: 50, price1Person: 35, price2Persons: 50, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },

  // ----------------------------------------------------
  // BLOQUE 4: GARAJES (9 Habitaciones)
  // 19, 20, 21, 22, 26, 32, 23, 24, 25
  // ----------------------------------------------------
  { id: '19', number: '19', floor: 'GARAJES', type: 'Ejecutiva', price: 38, price1Person: 25, price2Persons: 38, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '20', number: '20', floor: 'GARAJES', type: 'Ejecutiva', price: 38, price1Person: 25, price2Persons: 38, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '21', number: '21', floor: 'GARAJES', type: 'Ejecutiva', price: 38, price1Person: 25, price2Persons: 38, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '22', number: '22', floor: 'GARAJES', type: 'Doble', price: 40, price1Person: 40, price2Persons: 40, hasSinglePrice: true, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '26', number: '26', floor: 'GARAJES', type: 'Triple', price: 55, price1Person: 55, price2Persons: 55, hasSinglePrice: true, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '32', number: '32', floor: 'GARAJES', type: 'Doble', price: 40, price1Person: 40, price2Persons: 40, hasSinglePrice: true, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '23', number: '23', floor: 'GARAJES', type: 'Sencilla', price: 35, price1Person: 23, price2Persons: 35, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
  { id: '24', number: '24', floor: 'GARAJES', type: 'Sencilla', price: 35, price1Person: 23, price2Persons: 35, hasSinglePrice: false, status: 'V', cleaningStatus: 'POR LIMPIAR' },
  { id: '25', number: '25', floor: 'GARAJES', type: 'Sencilla', price: 35, price1Person: 23, price2Persons: 35, hasSinglePrice: false, status: 'V', cleaningStatus: 'LIMPIA' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Agua Mineral sin gas 500ml', category: 'Bebidas', price: 1.00, stock: 50, unit: 'botella' },
  { id: 'p2', name: 'Agua Mineral con gas 500ml', category: 'Bebidas', price: 1.00, stock: 30, unit: 'botella' },
  { id: 'p3', name: 'Coca Cola 500ml', category: 'Bebidas', price: 1.50, stock: 40, unit: 'botella' },
  { id: 'p4', name: 'Sprite 500ml', category: 'Bebidas', price: 1.50, stock: 25, unit: 'botella' },
  { id: 'p5', name: 'Cerveza Club 330ml', category: 'Licores', price: 2.00, stock: 40, unit: 'lata' },
  { id: 'p6', name: 'Cerveza Pilsener 330ml', category: 'Licores', price: 1.75, stock: 35, unit: 'lata' },
  { id: 'p7', name: 'Red Bull Energizante', category: 'Bebidas', price: 3.00, stock: 20, unit: 'lata' },
  { id: 'p8', name: 'Café Caliente', category: 'Bebidas', price: 1.00, stock: 50, unit: 'taza' },
  { id: 'p9', name: 'Papas Fritas Ruffles', category: 'Snacks', price: 1.25, stock: 30, unit: 'paquete' },
  { id: 'p10', name: 'Doritos Nachos', category: 'Snacks', price: 1.25, stock: 25, unit: 'paquete' },
  { id: 'p11', name: 'Chocolates Barra', category: 'Snacks', price: 1.00, stock: 30, unit: 'barra' },
  { id: 'p12', name: 'Galletas Oreo', category: 'Snacks', price: 0.75, stock: 35, unit: 'paquete' },
  { id: 'p13', name: 'Kit Dental (Cepillo + Pasta)', category: 'Higiene / Otros', price: 1.50, stock: 20, unit: 'kit' },
];

export const INITIAL_RECEPTIONISTS: Receptionist[] = [
  { id: 'rec-1', cedula: '0912345678', name: 'Carlos Mendoza', phone: '0991234567' },
  { id: 'rec-2', cedula: '0923456789', name: 'Elena Torres', phone: '0992345678' },
  { id: 'rec-3', cedula: '0934567890', name: 'Patricia Morales', phone: '0993456789' },
  { id: 'rec-4', cedula: '0945678901', name: 'Javier Ramírez', phone: '0994567890' }
];

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'shift-current',
    name: 'Turno Día (08:00 a 18:00)',
    date: new Date().toISOString().split('T')[0],
    receptionistName: 'Carlos Mendoza',
    receptionistCedula: '0912345678',
    previousShiftReceptionist: 'Elena Torres',
    initialCash: 100.00, // Base de caja en efectivo
    cashRetainedInDrawer: 100.00,
    cashHandedOverOrVault: 0,
    status: 'abierto',
    openedAt: new Date().toISOString(),
    notes: 'Caja recibida con base inicial de $100.00'
  }
];

// Comienza completamente vacío para que el usuario pueda realizar todos sus ejercicios de prueba
export const INITIAL_BOOKINGS: Booking[] = [];

// Gastos iniciales vacíos
export const INITIAL_EXPENSES: Expense[] = [];
