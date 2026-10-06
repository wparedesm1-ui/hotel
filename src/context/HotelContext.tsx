import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Room,
  Booking,
  Product,
  Expense,
  Shift,
  ShiftSummary,
  CleaningStatus,
  RoomStatus,
  PaymentMethod,
  ConsumptionItem,
  Receptionist
} from '../types/hotel';
import {
  INITIAL_ROOMS,
  INITIAL_PRODUCTS,
  INITIAL_BOOKINGS,
  INITIAL_EXPENSES,
  INITIAL_SHIFTS,
  INITIAL_RECEPTIONISTS
} from '../data/initialHotelData';

interface HotelContextType {
  rooms: Room[];
  bookings: Booking[];
  products: Product[];
  expenses: Expense[];
  shifts: Shift[];
  activeShift: Shift;
  activeTab: 'visual' | 'planilla' | 'kiosco' | 'caja' | 'reservas' | 'turnos';
  setActiveTab: (tab: 'visual' | 'planilla' | 'kiosco' | 'caja' | 'reservas' | 'turnos') => void;
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room | null) => void;
  
  // Room Actions
  checkInRoom: (bookingData: {
    roomNumber: string;
    guestName: string;
    guestDoc?: string;
    guestPhone?: string;
    adults: number;
    children: number;
    checkInDate: string;
    checkInTime: string;
    checkOutDate: string;
    checkOutTime: string;
    pricePerNight: number;
    nights: number;
    paymentMethod: PaymentMethod;
    invoiceOrReceipt?: string;
    observations?: string;
    paidAmount: number;
  }) => void;
  checkOutRoom: (roomNumber: string, liberationTime?: string, markAsClean?: boolean) => void;
  extendStay: (
    roomNumber: string,
    additionalNights: number,
    payNow: boolean,
    paymentMethod?: PaymentMethod,
    newCheckOutDate?: string,
    notes?: string
  ) => void;
  settleBookingAndCheckOut: (
    roomNumber: string,
    paidAmountToSettle: number,
    paymentMethod: PaymentMethod,
    invoiceOrReceipt?: string
  ) => void;
  updateRoomCleaning: (roomNumber: string, status: CleaningStatus) => void;
  updateRoomNotes: (roomNumber: string, notes: string) => void;
  updateRoomPrices: (roomNumber: string, prices: { price1Person: number; price2Persons: number; priceExtraPerson?: number }) => void;
  updateRoomFull: (roomId: string, updates: Partial<Room>) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  deleteRoom: (roomId: string) => void;
  resetRoomsCleanAndFree: () => void;
  
  // Consumptions (Snacks & Drinks)
  addConsumption: (item: {
    roomNumber?: string;
    bookingId?: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    paymentMethod: PaymentMethod;
    isPaid: boolean;
  }) => void;
  removeConsumption: (consumptionId: string, bookingId?: string | null) => void;
  payConsumption: (consumptionId: string, bookingId: string, paymentMethod: PaymentMethod) => void;
  
  // Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Expenses (Gastos del Hotel / Salidas de dinero)
  addExpense: (expense: {
    concept: string;
    category: Expense['category'];
    amount: number;
    paymentMethod: 'E' | 'TR';
    voucherNumber?: string;
    notes?: string;
  }) => void;
  deleteExpense: (id: string) => void;
  
  // Reservations
  createReservation: (reservationData: {
    roomNumber: string;
    guestName: string;
    guestDoc?: string;
    guestPhone?: string;
    adults: number;
    children: number;
    checkInDate: string;
    checkInTime: string;
    checkOutDate: string;
    checkOutTime: string;
    pricePerNight: number;
    nights: number;
    paymentMethod: PaymentMethod;
    invoiceOrReceipt?: string;
    observations?: string;
    advancePaid: number;
  }) => void;
  cancelReservation: (bookingId: string) => void;
  convertReservationToCheckIn: (bookingId: string) => void;
  
  // Receptionists
  receptionists: Receptionist[];
  findReceptionistByCedula: (cedula: string) => Receptionist | undefined;
  saveReceptionist: (receptionist: Omit<Receptionist, 'id'>) => Receptionist;

  // Shift Management
  switchShift: (data: {
    receptionistName: string;
    receptionistCedula?: string;
    shiftName: string;
    initialCash?: number;
    cashRetainedInDrawer?: number;
    cashHandedOverOrVault?: number;
    notes?: string;
  }) => void;
  closeCurrentShift: (data?: {
    notes?: string;
    cashRetainedInDrawer?: number;
    cashHandedOverOrVault?: number;
  }) => void;
  getShiftSummary: (shiftId?: string) => ShiftSummary;
  
  // Helpers & Reporting
  exportDailySalesToExcel: (targetDate?: string) => void;
  getRoomBooking: (roomNumber: string) => Booking | undefined;
  resetAllData: () => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROOMS: 'hotel_sys_rooms_v13_shifts_receptionists',
  BOOKINGS: 'hotel_sys_bookings_v13_shifts_receptionists',
  PRODUCTS: 'hotel_sys_products_v13_shifts_receptionists',
  EXPENSES: 'hotel_sys_expenses_v13_shifts_receptionists',
  SHIFTS: 'hotel_sys_shifts_v13_shifts_receptionists',
  ACTIVE_SHIFT: 'hotel_sys_active_shift_v13_shifts_receptionists',
  RECEPTIONISTS: 'hotel_sys_receptionists_v13_shifts_receptionists'
};

export const HotelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [receptionists, setReceptionists] = useState<Receptionist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECEPTIONISTS);
      return saved ? JSON.parse(saved) : INITIAL_RECEPTIONISTS;
    } catch {
      return INITIAL_RECEPTIONISTS;
    }
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
      if (saved) {
        const parsed: Room[] = JSON.parse(saved);
        if (parsed.length !== 44 || parsed.some(r => r.number === '101') || parsed[3]?.number !== '33') {
          return INITIAL_ROOMS;
        }
        // Sync any rooms with official base prices
        return parsed.map(r => {
          const official = INITIAL_ROOMS.find(init => init.number === r.number);
          if (official) {
            return {
              ...r,
              price: official.price,
              price1Person: official.price1Person,
              price2Persons: official.price2Persons,
              hasSinglePrice: official.hasSinglePrice
            };
          }
          return r;
        });
      }
      return INITIAL_ROOMS;
    } catch {
      return INITIAL_ROOMS;
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (saved) {
        const parsed: Booking[] = JSON.parse(saved);
        if (parsed.some(b => b.roomNumber === '102')) {
          return INITIAL_BOOKINGS;
        }
        return parsed;
      }
      return INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
    } catch {
      return INITIAL_SHIFTS;
    }
  });

  const [activeShift, setActiveShift] = useState<Shift>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SHIFT);
      return saved ? JSON.parse(saved) : INITIAL_SHIFTS[0];
    } catch {
      return INITIAL_SHIFTS[0];
    }
  });

  const [activeTab, setActiveTab] = useState<'visual' | 'planilla' | 'kiosco' | 'caja' | 'reservas' | 'turnos'>('visual');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECEPTIONISTS, JSON.stringify(receptionists));
  }, [receptionists]);

  const findReceptionistByCedula = (cedula: string): Receptionist | undefined => {
    const clean = cedula.trim();
    if (!clean) return undefined;
    return receptionists.find(r => r.cedula.trim() === clean);
  };

  const saveReceptionist = (data: Omit<Receptionist, 'id'>): Receptionist => {
    const existing = receptionists.find(r => r.cedula.trim() === data.cedula.trim());
    if (existing) {
      const updated = { ...existing, ...data };
      setReceptionists(prev => prev.map(r => r.id === existing.id ? updated : r));
      return updated;
    }
    const newRec: Receptionist = {
      ...data,
      id: `rec-${Date.now()}`
    };
    setReceptionists(prev => [...prev, newRec]);
    return newRec;
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SHIFT, JSON.stringify(activeShift));
  }, [activeShift]);

  // Keep selectedRoom up to date when rooms update
  useEffect(() => {
    if (selectedRoom) {
      const updated = rooms.find(r => r.id === selectedRoom.id);
      if (updated && (updated.status !== selectedRoom.status || updated.cleaningStatus !== selectedRoom.cleaningStatus || updated.currentBookingId !== selectedRoom.currentBookingId)) {
        setSelectedRoom(updated);
      }
    }
  }, [rooms, selectedRoom]);

  const getRoomBooking = (roomNumber: string): Booking | undefined => {
    const room = rooms.find(r => r.number === roomNumber);
    if (!room || !room.currentBookingId) return undefined;
    return bookings.find(b => b.id === room.currentBookingId);
  };

  // CHECK-IN
  const checkInRoom = (bookingData: {
    roomNumber: string;
    guestName: string;
    guestDoc?: string;
    guestPhone?: string;
    adults: number;
    children: number;
    checkInDate: string;
    checkInTime: string;
    checkOutDate: string;
    checkOutTime: string;
    pricePerNight: number;
    nights: number;
    paymentMethod: PaymentMethod;
    invoiceOrReceipt?: string;
    observations?: string;
    paidAmount: number;
  }) => {
    const newBookingId = `b-${Date.now()}`;
    const roomTotal = bookingData.pricePerNight * bookingData.nights;

    const newBooking: Booking = {
      id: newBookingId,
      roomNumber: bookingData.roomNumber,
      guestName: bookingData.guestName,
      guestDoc: bookingData.guestDoc || '',
      guestPhone: bookingData.guestPhone || '',
      adults: bookingData.adults,
      children: bookingData.children,
      checkInDate: bookingData.checkInDate,
      checkInTime: bookingData.checkInTime,
      checkOutDate: bookingData.checkOutDate,
      checkOutTime: bookingData.checkOutTime,
      pricePerNight: bookingData.pricePerNight,
      nights: bookingData.nights,
      roomTotal,
      paymentMethod: bookingData.paymentMethod,
      invoiceOrReceipt: bookingData.invoiceOrReceipt || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      observations: bookingData.observations || '',
      shiftId: activeShift.id,
      receptionistName: activeShift.receptionistName,
      status: 'activa',
      createdAt: new Date().toISOString(),
      paidAmount: bookingData.paidAmount,
      consumptions: []
    };

    setBookings(prev => [newBooking, ...prev]);

    // Update Room
    setRooms(prev =>
      prev.map(r =>
        r.number === bookingData.roomNumber
          ? { ...r, status: 'O', currentBookingId: newBookingId, cleaningStatus: 'LIMPIA' }
          : r
      )
    );
  };

  // CHECK-OUT: Por defecto la habitación queda automáticamente POR LIMPIAR
  const checkOutRoom = (roomNumber: string, liberationTime?: string, markAsClean: boolean = false) => {
    const now = new Date();
    const timeString = liberationTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const currentBooking = getRoomBooking(roomNumber);

    if (currentBooking) {
      setBookings(prev =>
        prev.map(b =>
          b.id === currentBooking.id
            ? { ...b, status: 'finalizada', actualLiberationTime: timeString }
            : b
        )
      );
    }

    // Al retirarse el cliente la habitación queda automáticamente POR LIMPIAR
    setRooms(prev =>
      prev.map(r =>
        r.number === roomNumber
          ? {
              ...r,
              status: 'V',
              cleaningStatus: markAsClean ? 'LIMPIA' : 'POR LIMPIAR',
              currentBookingId: null,
              liberationTime: timeString
            }
          : r
      )
    );
  };

  // COBRO Y CHECK-OUT: Cobra saldo pendiente y retira al cliente; la habitación queda automáticamente POR LIMPIAR
  const settleBookingAndCheckOut = (
    roomNumber: string,
    paidAmountToSettle: number,
    paymentMethod: PaymentMethod,
    invoiceOrReceipt?: string
  ) => {
    const currentBooking = getRoomBooking(roomNumber);
    if (!currentBooking) return;

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setBookings(prev =>
      prev.map(b => {
        if (b.id !== currentBooking.id) return b;
        return {
          ...b,
          status: 'finalizada',
          paidAmount: b.paidAmount + paidAmountToSettle,
          paymentMethod,
          actualLiberationTime: timeString,
          invoiceOrReceipt: invoiceOrReceipt || b.invoiceOrReceipt,
          consumptions: b.consumptions.map(c => ({
            ...c,
            isPaid: true,
            paymentMethod: c.isPaid ? c.paymentMethod : paymentMethod
          }))
        };
      })
    );

    // Habitación desocupada queda automáticamente POR LIMPIAR
    setRooms(prev =>
      prev.map(r =>
        r.number === roomNumber
          ? {
              ...r,
              status: 'V',
              cleaningStatus: 'POR LIMPIAR',
              currentBookingId: null,
              liberationTime: timeString
            }
          : r
      )
    );
  };

  // EXTENSIÓN DE ESTADÍA: Hospedarse otro día (opción de pagar ahora o pagar otro día/al check-out)
  const extendStay = (
    roomNumber: string,
    additionalNights: number,
    payNow: boolean,
    paymentMethod?: PaymentMethod,
    newCheckOutDate?: string,
    notes?: string
  ) => {
    const currentBooking = getRoomBooking(roomNumber);
    if (!currentBooking) return;

    const costToAdd = currentBooking.pricePerNight * additionalNights;
    let nextCheckOut = newCheckOutDate;
    if (!nextCheckOut) {
      try {
        const parts = currentBooking.checkOutDate.split('-');
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        d.setDate(d.getDate() + additionalNights);
        nextCheckOut = d.toISOString().split('T')[0];
      } catch {
        const d = new Date();
        d.setDate(d.getDate() + additionalNights);
        nextCheckOut = d.toISOString().split('T')[0];
      }
    }

    const noteAdd = payNow
      ? `Extensión: +${additionalNights} noche(s) ($${costToAdd.toFixed(2)}) COBRADA en ${paymentMethod === 'TR' ? 'Transferencia' : 'Efectivo'}.`
      : `Extensión: +${additionalNights} noche(s) ($${costToAdd.toFixed(2)}) PENDIENTE (Pagar otro día / Salida).`;

    const updatedObs = currentBooking.observations
      ? `${currentBooking.observations}. ${noteAdd}`
      : noteAdd;

    setBookings(prev =>
      prev.map(b => {
        if (b.id !== currentBooking.id) return b;
        return {
          ...b,
          nights: b.nights + additionalNights,
          roomTotal: b.roomTotal + costToAdd,
          paidAmount: payNow ? b.paidAmount + costToAdd : b.paidAmount,
          checkOutDate: nextCheckOut || b.checkOutDate,
          observations: notes ? `${updatedObs} ${notes}` : updatedObs
        };
      })
    );
  };

  const updateRoomCleaning = (roomNumber: string, status: CleaningStatus) => {
    setRooms(prev =>
      prev.map(r => (r.number === roomNumber ? { ...r, cleaningStatus: status } : r))
    );
  };

  const updateRoomNotes = (roomNumber: string, notes: string) => {
    setRooms(prev =>
      prev.map(r => (r.number === roomNumber ? { ...r, notes } : r))
    );
  };

  const updateRoomPrices = (roomNumber: string, prices: { price1Person: number; price2Persons: number; priceExtraPerson?: number }) => {
    setRooms(prev =>
      prev.map(r =>
        r.number === roomNumber
          ? {
              ...r,
              price1Person: prices.price1Person,
              price2Persons: prices.price2Persons,
              priceExtraPerson: prices.priceExtraPerson ?? r.priceExtraPerson,
              price: prices.price2Persons // standard base
            }
          : r
      )
    );
  };

  const updateRoomFull = (roomId: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(r => (r.id === roomId ? { ...r, ...updates } : r)));
  };

  const addRoom = (room: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...room,
      id: `room-${Date.now()}`
    };
    setRooms(prev => [...prev, newRoom]);
  };

  const deleteRoom = (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  // CONSUMPTIONS (Snacks & Drinks)
  const addConsumption = (item: {
    roomNumber?: string;
    bookingId?: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    paymentMethod: PaymentMethod;
    isPaid: boolean;
  }) => {
    const newConsumptionId = `c-${Date.now()}`;
    const total = item.unitPrice * item.quantity;

    const newConsumption: ConsumptionItem = {
      id: newConsumptionId,
      roomNumber: item.roomNumber || null,
      bookingId: item.bookingId || null,
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      total,
      paymentMethod: item.paymentMethod,
      isPaid: item.isPaid,
      createdAt: new Date().toISOString(),
      shiftId: activeShift.id,
      receptionistName: activeShift.receptionistName
    };

    // If attached to a booking, append to booking consumptions
    if (item.bookingId) {
      setBookings(prev =>
        prev.map(b =>
          b.id === item.bookingId
            ? { ...b, consumptions: [...b.consumptions, newConsumption] }
            : b
        )
      );
    }

    // Deduct stock from product catalog
    setProducts(prev =>
      prev.map(p =>
        p.id === item.productId
          ? { ...p, stock: Math.max(0, p.stock - item.quantity) }
          : p
      )
    );
  };

  const removeConsumption = (consumptionId: string, bookingId?: string | null) => {
    if (bookingId) {
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? { ...b, consumptions: b.consumptions.filter(c => c.id !== consumptionId) }
            : b
        )
      );
    }
  };

  const payConsumption = (consumptionId: string, bookingId: string, paymentMethod: PaymentMethod) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          consumptions: b.consumptions.map(c =>
            c.id === consumptionId ? { ...c, isPaid: true, paymentMethod } : c
          )
        };
      })
    );
  };

  // PRODUCTS CATALOG
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: `p-${Date.now()}`
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // EXPENSES (Salidas de Dinero / Gastos del Hotel)
  const addExpense = (expense: {
    concept: string;
    category: Expense['category'];
    amount: number;
    paymentMethod: 'E' | 'TR';
    voucherNumber?: string;
    notes?: string;
  }) => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      concept: expense.concept,
      category: expense.category,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      voucherNumber: expense.voucherNumber || `GTO-${Math.floor(100 + Math.random() * 900)}`,
      shiftId: activeShift.id,
      receptionistName: activeShift.receptionistName,
      createdAt: new Date().toISOString(),
      notes: expense.notes || ''
    };

    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // RESERVATIONS
  const createReservation = (data: {
    roomNumber: string;
    guestName: string;
    guestDoc?: string;
    guestPhone?: string;
    adults: number;
    children: number;
    checkInDate: string;
    checkInTime: string;
    checkOutDate: string;
    checkOutTime: string;
    pricePerNight: number;
    nights: number;
    paymentMethod: PaymentMethod;
    invoiceOrReceipt?: string;
    observations?: string;
    advancePaid: number;
  }) => {
    const newBookingId = `res-${Date.now()}`;
    const roomTotal = data.pricePerNight * data.nights;

    const newReservation: Booking = {
      id: newBookingId,
      roomNumber: data.roomNumber,
      guestName: data.guestName,
      guestDoc: data.guestDoc || '',
      guestPhone: data.guestPhone || '',
      adults: data.adults,
      children: data.children,
      checkInDate: data.checkInDate,
      checkInTime: data.checkInTime,
      checkOutDate: data.checkOutDate,
      checkOutTime: data.checkOutTime,
      pricePerNight: data.pricePerNight,
      nights: data.nights,
      roomTotal,
      paymentMethod: data.paymentMethod,
      invoiceOrReceipt: data.invoiceOrReceipt || `RES-${Math.floor(100 + Math.random() * 900)}`,
      observations: data.observations || '',
      shiftId: activeShift.id,
      receptionistName: activeShift.receptionistName,
      status: 'reservada',
      createdAt: new Date().toISOString(),
      paidAmount: data.advancePaid,
      consumptions: []
    };

    setBookings(prev => [newReservation, ...prev]);

    // Mark room as R (Reservada)
    setRooms(prev =>
      prev.map(r =>
        r.number === data.roomNumber
          ? { ...r, status: 'R', currentBookingId: newBookingId }
          : r
      )
    );
  };

  const cancelReservation = (bookingId: string) => {
    const res = bookings.find(b => b.id === bookingId);
    if (res) {
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelada' } : b))
      );
      setRooms(prev =>
        prev.map(r =>
          r.number === res.roomNumber && r.currentBookingId === bookingId
            ? { ...r, status: 'V', currentBookingId: null }
            : r
        )
      );
    }
  };

  const convertReservationToCheckIn = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: 'activa',
              checkInDate: today,
              checkInTime: currentTime
            }
          : b
      )
    );

    setRooms(prev =>
      prev.map(r =>
        r.number === booking.roomNumber
          ? { ...r, status: 'O', currentBookingId: bookingId, cleaningStatus: 'LIMPIA' }
          : r
      )
    );
  };

  // SHIFTS
  const switchShift = (data: {
    receptionistName: string;
    receptionistCedula?: string;
    shiftName: string;
    initialCash?: number;
    cashRetainedInDrawer?: number;
    cashHandedOverOrVault?: number;
    notes?: string;
  }) => {
    const baseCash = data.initialCash ?? (data.cashRetainedInDrawer ?? activeShift.initialCash);
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      name: data.shiftName,
      date: new Date().toISOString().split('T')[0],
      receptionistName: data.receptionistName,
      receptionistCedula: data.receptionistCedula,
      previousShiftReceptionist: activeShift.receptionistName,
      initialCash: baseCash,
      cashRetainedInDrawer: data.cashRetainedInDrawer ?? baseCash,
      cashHandedOverOrVault: data.cashHandedOverOrVault ?? 0,
      status: 'abierto',
      openedAt: new Date().toISOString(),
      notes: data.notes
    };

    setShifts(prev => [newShift, ...prev]);
    setActiveShift(newShift);
  };

  const closeCurrentShift = (data?: {
    notes?: string;
    cashRetainedInDrawer?: number;
    cashHandedOverOrVault?: number;
  }) => {
    const closed: Shift = {
      ...activeShift,
      status: 'cerrado',
      closedAt: new Date().toISOString(),
      notes: data?.notes ?? activeShift.notes,
      cashRetainedInDrawer: data?.cashRetainedInDrawer ?? activeShift.cashRetainedInDrawer,
      cashHandedOverOrVault: data?.cashHandedOverOrVault ?? activeShift.cashHandedOverOrVault
    };

    setShifts(prev => prev.map(s => (s.id === activeShift.id ? closed : s)));
    setActiveShift(closed);
  };

  // SHIFT REPORT CALCULATION
  const getShiftSummary = (shiftId?: string): ShiftSummary => {
    const targetShift = shiftId ? shifts.find(s => s.id === shiftId) || activeShift : activeShift;

    // Filter items related to this shift
    const shiftBookings = bookings.filter(b => b.shiftId === targetShift.id && b.status !== 'cancelada');
    const shiftExpenses = expenses.filter(e => e.shiftId === targetShift.id);

    // Collect all consumptions for this shift
    const allConsumptions: ConsumptionItem[] = [];
    bookings.forEach(b => {
      b.consumptions.forEach(c => {
        if (c.shiftId === targetShift.id) {
          allConsumptions.push(c);
        }
      });
    });

    // Rooms sold in shift
    const roomsSold = shiftBookings.length;

    let roomSalesTotal = 0;
    let roomSalesCash = 0;
    let roomSalesTransfer = 0;
    let roomSalesCardOther = 0;

    shiftBookings.forEach(b => {
      const amount = b.paidAmount > 0 ? b.paidAmount : b.roomTotal;
      roomSalesTotal += amount;
      if (b.paymentMethod === 'E') {
        roomSalesCash += amount;
      } else if (b.paymentMethod === 'TR') {
        roomSalesTransfer += amount;
      } else {
        roomSalesCardOther += amount;
      }
    });

    let snackSalesTotal = 0;
    let snackSalesCash = 0;
    let snackSalesTransfer = 0;

    allConsumptions.forEach(c => {
      snackSalesTotal += c.total;
      if (c.paymentMethod === 'E') {
        snackSalesCash += c.total;
      } else if (c.paymentMethod === 'TR') {
        snackSalesTransfer += c.total;
      }
    });

    const totalIncome = roomSalesTotal + snackSalesTotal;
    const totalCashIncome = roomSalesCash + snackSalesCash;
    const totalTransferIncome = roomSalesTransfer + snackSalesTransfer;

    let expensesTotal = 0;
    let expensesCash = 0;
    let expensesTransfer = 0;

    shiftExpenses.forEach(e => {
      expensesTotal += e.amount;
      if (e.paymentMethod === 'E') {
        expensesCash += e.amount;
      } else {
        expensesTransfer += e.amount;
      }
    });

    const initialCash = targetShift.initialCash || 0;
    // Net cash in physical drawer: Starting cash + cash in - cash out
    const netCashInDrawer = initialCash + totalCashIncome - expensesCash;
    const totalBalanceNet = totalIncome - expensesTotal;

    return {
      shift: targetShift,
      roomsSold,
      roomSalesTotal,
      roomSalesCash,
      roomSalesTransfer,
      roomSalesCardOther,
      snackSalesTotal,
      snackSalesCash,
      snackSalesTransfer,
      totalIncome,
      totalCashIncome,
      totalTransferIncome,
      expensesTotal,
      expensesCash,
      expensesTransfer,
      initialCash,
      netCashInDrawer,
      cashRetainedInDrawer: targetShift.cashRetainedInDrawer,
      cashHandedOverOrVault: targetShift.cashHandedOverOrVault,
      totalBalanceNet,
      expensesList: shiftExpenses,
      bookingsList: shiftBookings,
      consumptionsList: allConsumptions
    };
  };

  const exportDailySalesToExcel = (targetDate?: string) => {
    const dateToExport = targetDate || activeShift.date || new Date().toISOString().split('T')[0];
    const dayBookings = bookings.filter(b => b.checkInDate === dateToExport || b.createdAt.startsWith(dateToExport));
    const dayExpenses = expenses.filter(e => e.createdAt.startsWith(dateToExport));

    const dayConsumptions: ConsumptionItem[] = [];
    bookings.forEach(b => {
      b.consumptions.forEach(c => {
        if (c.createdAt.startsWith(dateToExport)) {
          dayConsumptions.push(c);
        }
      });
    });

    let totalHabEfectivo = 0;
    let totalHabTransf = 0;
    dayBookings.forEach(b => {
      const val = b.paidAmount > 0 ? b.paidAmount : b.roomTotal;
      if (b.paymentMethod === 'E') totalHabEfectivo += val;
      else totalHabTransf += val;
    });

    let totalSnackEfectivo = 0;
    let totalSnackTransf = 0;
    dayConsumptions.forEach(c => {
      if (c.paymentMethod === 'E') totalSnackEfectivo += c.total;
      else totalSnackTransf += c.total;
    });

    let totalGastosEfectivo = 0;
    let totalGastosTransf = 0;
    dayExpenses.forEach(e => {
      if (e.paymentMethod === 'E') totalGastosEfectivo += e.amount;
      else totalGastosTransf += e.amount;
    });

    const totalIngresosEfectivo = totalHabEfectivo + totalSnackEfectivo;
    const totalIngresosTransf = totalHabTransf + totalSnackTransf;
    const totalIngresosGeneral = totalIngresosEfectivo + totalIngresosTransf;
    const totalGastosGeneral = totalGastosEfectivo + totalGastosTransf;
    const balanceNeto = totalIngresosGeneral - totalGastosGeneral;

    const rows: string[][] = [];
    rows.push(['SISTEMA HOTELERO - REPORTE DE VENTAS DEL DÍA']);
    rows.push(['Fecha del Reporte:', dateToExport]);
    rows.push(['Generado por Recepcionista:', activeShift.receptionistName, 'Cédula:', activeShift.receptionistCedula || 'S/N']);
    rows.push(['Turno Actual:', activeShift.name]);
    rows.push([]);

    rows.push(['=== RESUMEN FINANCIERO DEL DÍA ===']);
    rows.push(['Concepto', 'Efectivo ($)', 'Transferencia ($)', 'Total ($)']);
    rows.push(['Ventas de Habitaciones (Hospedaje)', totalHabEfectivo.toFixed(2), totalHabTransf.toFixed(2), (totalHabEfectivo + totalHabTransf).toFixed(2)]);
    rows.push(['Ventas de Snacks y Bebidas (Kiosco)', totalSnackEfectivo.toFixed(2), totalSnackTransf.toFixed(2), (totalSnackEfectivo + totalSnackTransf).toFixed(2)]);
    rows.push(['TOTAL INGRESOS', totalIngresosEfectivo.toFixed(2), totalIngresosTransf.toFixed(2), totalIngresosGeneral.toFixed(2)]);
    rows.push(['GASTOS Y SALIDAS DE DINERO', totalGastosEfectivo.toFixed(2), totalGastosTransf.toFixed(2), totalGastosGeneral.toFixed(2)]);
    rows.push(['BALANCE NETO DEL DÍA', (totalIngresosEfectivo - totalGastosEfectivo).toFixed(2), (totalIngresosTransf - totalGastosTransf).toFixed(2), balanceNeto.toFixed(2)]);
    if (activeShift.cashRetainedInDrawer !== undefined) {
      rows.push(['Base que se deja en caja:', (activeShift.cashRetainedInDrawer || 0).toFixed(2)]);
    }
    if (activeShift.cashHandedOverOrVault !== undefined) {
      rows.push(['Valor retirado a guardar (Administración):', (activeShift.cashHandedOverOrVault || 0).toFixed(2)]);
    }
    rows.push([]);

    rows.push(['=== DETALLE DE HABITACIONES VENDIDAS ===']);
    rows.push(['Nº Habitación', 'Huésped', 'Cédula / Doc', 'Entrada', 'Salida', 'Noches', 'Tarifa Noche ($)', 'Forma de Pago', 'Total Cobrado ($)', 'Recibo / Factura', 'Recepcionista', 'Observaciones']);
    if (dayBookings.length === 0) {
      rows.push(['Sin ventas de habitaciones registradas en esta fecha']);
    } else {
      dayBookings.forEach(b => {
        rows.push([
          b.roomNumber,
          `"${b.guestName.replace(/"/g, '""')}"`,
          b.guestDoc || '',
          `${b.checkInDate} ${b.checkInTime}`,
          `${b.checkOutDate} ${b.checkOutTime}`,
          b.nights.toString(),
          b.pricePerNight.toFixed(2),
          b.paymentMethod === 'E' ? 'Efectivo' : 'Transferencia',
          (b.paidAmount || b.roomTotal).toFixed(2),
          b.invoiceOrReceipt || '',
          b.receptionistName,
          `"${(b.observations || '').replace(/"/g, '""')}"`
        ]);
      });
    }
    rows.push([]);

    rows.push(['=== DETALLE DE CONSUMOS DE SNACKS Y BEBIDAS ===']);
    rows.push(['Hora', 'Habitación / Destino', 'Producto', 'Cantidad', 'Precio Unitario ($)', 'Forma de Pago', 'Total ($)', 'Recepcionista']);
    if (dayConsumptions.length === 0) {
      rows.push(['Sin consumos de snacks registrados en esta fecha']);
    } else {
      dayConsumptions.forEach(c => {
        rows.push([
          c.createdAt.slice(11, 16),
          c.roomNumber ? `Hab ${c.roomNumber}` : 'Venta Mostrador',
          `"${c.productName.replace(/"/g, '""')}"`,
          c.quantity.toString(),
          c.unitPrice.toFixed(2),
          c.paymentMethod === 'E' ? 'Efectivo' : 'Transferencia',
          c.total.toFixed(2),
          c.receptionistName
        ]);
      });
    }
    rows.push([]);

    rows.push(['=== DETALLE DE GASTOS Y SALIDAS DE CAJA ===']);
    rows.push(['Hora', 'Concepto', 'Categoría', 'Método Salida', 'Monto ($)', 'Nº Comprobante', 'Recepcionista']);
    if (dayExpenses.length === 0) {
      rows.push(['Sin salidas de dinero registradas en esta fecha']);
    } else {
      dayExpenses.forEach(e => {
        rows.push([
          e.createdAt.slice(11, 16),
          `"${e.concept.replace(/"/g, '""')}"`,
          `"${e.category}"`,
          e.paymentMethod === 'E' ? 'Efectivo de Caja' : 'Transferencia',
          e.amount.toFixed(2),
          e.voucherNumber || '',
          e.receptionistName
        ]);
      });
    }

    const csvContent = '\uFEFF' + rows.map(r => r.join(';')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ventas_del_Dia_HOTEL_${dateToExport}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetRoomsCleanAndFree = () => {
    setRooms(INITIAL_ROOMS.map(r => {
      if (r.number === '1') {
        return {
          ...r,
          status: 'V',
          cleaningStatus: 'POR LIMPIAR',
          notes: 'HABITACIÓN DESHABILITADA',
          currentBookingId: null,
          liberationTime: undefined
        };
      }
      return {
        ...r,
        status: 'V',
        cleaningStatus: 'LIMPIA',
        currentBookingId: null,
        liberationTime: undefined
      };
    }));
    setBookings([]);
    setSelectedRoom(null);
  };

  const resetAllData = () => {
    localStorage.clear();
    setRooms(INITIAL_ROOMS);
    setProducts(INITIAL_PRODUCTS);
    setBookings(INITIAL_BOOKINGS);
    setExpenses(INITIAL_EXPENSES);
    setShifts(INITIAL_SHIFTS);
    setReceptionists(INITIAL_RECEPTIONISTS);
    setActiveShift(INITIAL_SHIFTS[0]);
    setSelectedRoom(null);
  };

  return (
    <HotelContext.Provider
      value={{
        rooms,
        bookings,
        products,
        expenses,
        shifts,
        activeShift,
        activeTab,
        setActiveTab,
        selectedRoom,
        setSelectedRoom,
        checkInRoom,
        checkOutRoom,
        extendStay,
        settleBookingAndCheckOut,
        updateRoomCleaning,
        updateRoomNotes,
        updateRoomPrices,
        updateRoomFull,
        addRoom,
        deleteRoom,
        resetRoomsCleanAndFree,
        addConsumption,
        removeConsumption,
        payConsumption,
        addProduct,
        updateProduct,
        deleteProduct,
        addExpense,
        deleteExpense,
        createReservation,
        cancelReservation,
        convertReservationToCheckIn,
        receptionists,
        findReceptionistByCedula,
        saveReceptionist,
        switchShift,
        closeCurrentShift,
        getShiftSummary,
        exportDailySalesToExcel,
        getRoomBooking,
        resetAllData
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
