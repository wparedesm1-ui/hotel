export type RoomFloor = 'PLANTA BAJA' | 'PRIMER PISO' | 'SEGUNDO PISO' | 'GARAJES' | (string & {});

export type RoomType =
  | 'Sencilla'
  | 'Doble'
  | 'Triple'
  | 'Ejecutiva'
  | 'Premium'
  | 'Suite'
  | 'Cuádruple'
  | 'Mini Suite'
  | 'Individual'
  | 'Matrimonial'
  | 'Familiar'
  | (string & {});

export type RoomStatus = 'V' | 'O' | 'R'; // V: Venta/Disponible, O: Ocupado, R: Reservado
export type CleaningStatus = 'LIMPIA' | 'POR LIMPIAR' | (string & {}); // Las 2 únicas opciones oficiales: 'LIMPIA' o 'POR LIMPIAR'

export type PaymentMethod = 'E' | 'TR'; // Solo dos opciones: E = Efectivo, TR = Transferencia

export interface Receptionist {
  id: string;
  cedula: string;
  name: string;
  phone?: string;
  role?: string;
}

export interface Room {
  id: string;
  number: string;
  floor: RoomFloor;
  type: RoomType;
  price: number; // default base price
  price1Person: number; // Precio para 1 persona
  price2Persons: number; // Precio para 2 personas
  hasSinglePrice?: boolean; // Para Dobles, Triples y Cuádruples que tienen un solo precio
  priceExtraPerson?: number; // Precio por persona adicional
  status: RoomStatus;
  cleaningStatus: CleaningStatus;
  currentBookingId?: string | null;
  liberationTime?: string;
  notes?: string;
}

export interface ConsumptionItem {
  id: string;
  bookingId?: string | null;
  roomNumber?: string | null;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  total: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  createdAt: string; // ISO string
  shiftId: string;
  receptionistName: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Bebidas' | 'Snacks' | 'Licores' | 'Higiene / Otros';
  price: number;
  stock: number;
  unit: string;
}

export interface Booking {
  id: string;
  roomNumber: string;
  guestName: string;
  guestDoc?: string;
  guestPhone?: string;
  adults: number;
  children: number;
  checkInDate: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM
  checkOutDate: string; // YYYY-MM-DD
  checkOutTime: string; // HH:MM
  actualLiberationTime?: string;
  pricePerNight: number;
  nights: number;
  roomTotal: number;
  paymentMethod: PaymentMethod;
  invoiceOrReceipt?: string;
  observations?: string;
  shiftId: string;
  receptionistName: string;
  status: 'activa' | 'finalizada' | 'reservada' | 'cancelada';
  createdAt: string;
  paidAmount: number;
  consumptions: ConsumptionItem[];
}

export type ExpenseCategory =
  | 'Limpieza y Lavandería'
  | 'Mantenimiento'
  | 'Compras / Snacks y Bebidas'
  | 'Alimentos y Desayunos'
  | 'Servicios Básicos'
  | 'Gastos Administrativos'
  | 'Imprevisto';

export interface Expense {
  id: string;
  concept: string; // "en qué se utilizó el dinero"
  category: ExpenseCategory;
  amount: number;
  paymentMethod: 'E' | 'TR'; // E = Efectivo de Caja, TR = Transferencia bancaria
  voucherNumber?: string;
  shiftId: string;
  receptionistName: string;
  createdAt: string; // ISO string
  notes?: string;
}

export interface Shift {
  id: string;
  name: string; // "Turno Día (08:00 a 18:00)" o "Turno Noche (18:00 a 08:00)"
  date: string; // YYYY-MM-DD
  receptionistName: string;
  receptionistCedula?: string;
  previousShiftReceptionist: string;
  initialCash: number; // Base de caja inicial en efectivo
  cashRetainedInDrawer?: number; // Valor que deja en caja (base para siguiente turno)
  cashHandedOverOrVault?: number; // Valor a guardar a parte (retirado para administración / sobre)
  status: 'abierto' | 'cerrado';
  openedAt: string;
  closedAt?: string;
  notes?: string;
}

export interface ShiftSummary {
  shift: Shift;
  roomsSold: number;
  roomSalesTotal: number;
  roomSalesCash: number;
  roomSalesTransfer: number;
  roomSalesCardOther: number;
  snackSalesTotal: number;
  snackSalesCash: number;
  snackSalesTransfer: number;
  totalIncome: number;
  totalCashIncome: number;
  totalTransferIncome: number;
  expensesTotal: number;
  expensesCash: number;
  expensesTransfer: number;
  initialCash: number;
  netCashInDrawer: number; // initialCash + totalCashIncome - expensesCash
  cashRetainedInDrawer?: number; // Valor que se queda en caja
  cashHandedOverOrVault?: number; // Valor a guardar a parte
  totalBalanceNet: number; // totalIncome - expensesTotal
  expensesList: Expense[];
  bookingsList: Booking[];
  consumptionsList: ConsumptionItem[];
}
