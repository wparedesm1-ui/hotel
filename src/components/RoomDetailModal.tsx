import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { Room, CleaningStatus, PaymentMethod } from '../types/hotel';
import {
  X,
  User,
  Calendar,
  Clock,
  Phone,
  CreditCard,
  Coffee,
  Plus,
  Trash2,
  CheckCircle,
  LogOut,
  Receipt,
  Sparkles,
  FileText,
  CalendarPlus,
  AlertTriangle
} from 'lucide-react';

export const RoomDetailModal: React.FC = () => {
  const {
    selectedRoom,
    setSelectedRoom,
    getRoomBooking,
    checkInRoom,
    checkOutRoom,
    extendStay,
    settleBookingAndCheckOut,
    updateRoomCleaning,
    updateRoomNotes,
    addConsumption,
    removeConsumption,
    payConsumption,
    products,
    convertReservationToCheckIn,
    cancelReservation,
    updateRoomPrices
  } = useHotel();

  if (!selectedRoom) return null;

  const currentBooking = getRoomBooking(selectedRoom.number);

  // Form State for Check-In
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const currentTimeStr = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

  const [guestName, setGuestName] = useState('');
  const [guestDoc, setGuestDoc] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkInTime, setCheckInTime] = useState(currentTimeStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [checkOutTime, setCheckOutTime] = useState('12:00');
  const isSinglePriceRoom = selectedRoom.hasSinglePrice || ['Doble', 'Triple', 'Cuádruple'].includes(selectedRoom.type);
  const defaultBasePrice = isSinglePriceRoom
    ? (selectedRoom.price2Persons || selectedRoom.price || selectedRoom.price1Person)
    : (selectedRoom.price1Person || selectedRoom.price);

  const [pricePerNight, setPricePerNight] = useState(defaultBasePrice);
  const [nights, setNights] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('E');
  const [invoiceOrReceipt, setInvoiceOrReceipt] = useState('');
  const [observations, setObservations] = useState('');
  const [paidAmount, setPaidAmount] = useState(defaultBasePrice);

  // Room Price Config Editor
  const [isEditingPrices, setIsEditingPrices] = useState(false);
  const [editPrice1, setEditPrice1] = useState(selectedRoom.price1Person.toString());
  const [editPrice2, setEditPrice2] = useState(selectedRoom.price2Persons.toString());
  const [editPriceExtra, setEditPriceExtra] = useState((selectedRoom.priceExtraPerson || 15).toString());

  // Keep in sync when selected room changes
  useEffect(() => {
    const isSingle = selectedRoom.hasSinglePrice || ['Doble', 'Triple', 'Cuádruple'].includes(selectedRoom.type);
    const p = isSingle ? (selectedRoom.price2Persons || selectedRoom.price) : selectedRoom.price1Person;
    setPricePerNight(p);
    setPaidAmount(p * nights);
    setEditPrice1(selectedRoom.price1Person.toString());
    setEditPrice2(selectedRoom.price2Persons.toString());
    setEditPriceExtra((selectedRoom.priceExtraPerson || 15).toString());
  }, [selectedRoom]);

  // Handle number of adults change and set price accordingly
  const handleAdultsChange = (num: number) => {
    setAdults(num);
    if (isSinglePriceRoom) {
      const p = selectedRoom.price2Persons || selectedRoom.price;
      setPricePerNight(p);
      setPaidAmount(p * nights);
      return;
    }
    if (num === 1) {
      const p = selectedRoom.price1Person;
      setPricePerNight(p);
      setPaidAmount(p * nights);
    } else if (num === 2) {
      const p = selectedRoom.price2Persons;
      setPricePerNight(p);
      setPaidAmount(p * nights);
    } else if (num > 2) {
      const extra = (num - 2) * (selectedRoom.priceExtraPerson || 15);
      const p = selectedRoom.price2Persons + extra;
      setPricePerNight(p);
      setPaidAmount(p * nights);
    }
  };

  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSinglePriceRoom) {
      const p = parseFloat(editPrice2) || parseFloat(editPrice1) || selectedRoom.price2Persons || selectedRoom.price;
      updateRoomPrices(selectedRoom.number, {
        price1Person: p,
        price2Persons: p,
        priceExtraPerson: 0
      });
      setPricePerNight(p);
      setPaidAmount(p * nights);
    } else {
      const p1 = parseFloat(editPrice1) || selectedRoom.price1Person;
      const p2 = parseFloat(editPrice2) || selectedRoom.price2Persons;
      const pe = parseFloat(editPriceExtra) || 15;
      updateRoomPrices(selectedRoom.number, {
        price1Person: p1,
        price2Persons: p2,
        priceExtraPerson: pe
      });
      if (adults === 1) setPricePerNight(p1);
      else if (adults === 2) setPricePerNight(p2);
      else setPricePerNight(p2 + (adults - 2) * pe);
    }
    setIsEditingPrices(false);
    alert(`¡Tarifas de Habitación ${selectedRoom.number} actualizadas correctamente!`);
  };

  // Quick Snack state
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [snackQty, setSnackQty] = useState(1);
  const [snackPayMethod, setSnackPayMethod] = useState<PaymentMethod>('E');
  const [chargeToRoom, setChargeToRoom] = useState(true);

  // Active sub-tab in occupied view
  const [occupiedTab, setOccupiedTab] = useState<'cuenta' | 'consumos' | 'datos'>('cuenta');

  // Estados para Extender Estadía / Hospedarse Otro Día
  const [isExtendingStay, setIsExtendingStay] = useState(false);
  const [extraNights, setExtraNights] = useState(1);
  const [extendPayMethod, setExtendPayMethod] = useState<PaymentMethod>('E');
  const [extendNotes, setExtendNotes] = useState('');

  // Estados para Cobro de Saldo al Retirarse / Check-Out
  const [checkoutPayMethod, setCheckoutPayMethod] = useState<PaymentMethod>('E');
  const [checkoutReceipt, setCheckoutReceipt] = useState('');

  // Recalculate nights when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const calcNights = diffDays > 0 ? diffDays : 1;
      setNights(calcNights);
      setPaidAmount(pricePerNight * calcNights);
    }
  }, [checkInDate, checkOutDate, pricePerNight]);

  // Handle Check-In submission
  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('Por favor ingrese el nombre del huésped');
      return;
    }

    checkInRoom({
      roomNumber: selectedRoom.number,
      guestName: guestName.trim(),
      guestDoc: guestDoc.trim(),
      guestPhone: guestPhone.trim(),
      adults: Number(adults),
      children: Number(children),
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      pricePerNight: Number(pricePerNight),
      nights: Number(nights),
      paymentMethod,
      invoiceOrReceipt: invoiceOrReceipt.trim(),
      observations: observations.trim(),
      paidAmount: Number(paidAmount)
    });

    // Close or reload modal
    setSelectedRoom(null);
  };

  // Handle Add Snack to current booking
  const handleAddSnack = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProductId);
    if (!product || !currentBooking) return;

    addConsumption({
      roomNumber: selectedRoom.number,
      bookingId: currentBooking.id,
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: snackQty,
      paymentMethod: chargeToRoom ? currentBooking.paymentMethod : snackPayMethod,
      isPaid: !chargeToRoom
    });

    setSnackQty(1);
  };

  // Calculations for occupied room bill
  const totalSnacks = currentBooking
    ? currentBooking.consumptions.reduce((sum, c) => sum + c.total, 0)
    : 0;
  const unpaidSnacks = currentBooking
    ? currentBooking.consumptions.filter(c => !c.isPaid).reduce((sum, c) => sum + c.total, 0)
    : 0;
  const totalRoomBill = currentBooking ? currentBooking.roomTotal : 0;
  const grandTotal = totalRoomBill + totalSnacks;
  const alreadyPaid = currentBooking
    ? currentBooking.paidAmount + (totalSnacks - unpaidSnacks)
    : 0;
  const balancePending = grandTotal - alreadyPaid;

  // COBRO DE HABITACIÓN CON SALIDA AUTOMÁTICAMENTE POR LIMPIAR
  const handleSettleAndCheckout = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentBooking) return;

    if (balancePending > 0) {
      if (
        window.confirm(
          `¿Confirmar cobro de saldo de $${balancePending.toFixed(2)} (${checkoutPayMethod === 'TR' ? 'Transferencia' : 'Efectivo'}) de la habitación ${selectedRoom.number} de ${currentBooking.guestName}?\n\nAl registrar el cobro y retirarse el cliente, la habitación quedará AUTOMÁTICAMENTE en estado POR LIMPIAR.`
        )
      ) {
        settleBookingAndCheckOut(
          selectedRoom.number,
          balancePending,
          checkoutPayMethod,
          checkoutReceipt.trim() || undefined
        );
        alert(
          `¡Cobro de $${balancePending.toFixed(2)} registrado con éxito!\n\nEl cliente ${currentBooking.guestName} se ha retirado y la habitación ${selectedRoom.number} ha quedado automáticamente marcada como POR LIMPIAR para aseo.`
        );
        setSelectedRoom(null);
      }
    } else {
      if (
        window.confirm(
          `¿Confirmar salida del huésped ${currentBooking.guestName} de la habitación ${selectedRoom.number}?\n\nLa habitación quedará AUTOMÁTICAMENTE en estado POR LIMPIAR.`
        )
      ) {
        checkOutRoom(selectedRoom.number, undefined, false);
        alert(
          `¡Check-Out completado!\n\nEl cliente se ha retirado y la habitación ${selectedRoom.number} quedó automáticamente marcada como POR LIMPIAR.`
        );
        setSelectedRoom(null);
      }
    }
  };

  // EXTENDER ESTADÍA / HOSPEDARSE OTRO DÍA (CON O SIN PAGO INMEDIATO)
  const handleExtendStaySubmit = (payNow: boolean) => {
    if (!currentBooking) return;
    const additionalCost = currentBooking.pricePerNight * extraNights;

    if (payNow) {
      if (
        window.confirm(
          `¿Extender estadía de ${currentBooking.guestName} por ${extraNights} noche(s) cobrando $${additionalCost.toFixed(2)} (${extendPayMethod === 'TR' ? 'Transferencia' : 'Efectivo'}) ahora?`
        )
      ) {
        extendStay(
          selectedRoom.number,
          extraNights,
          true,
          extendPayMethod,
          undefined,
          extendNotes.trim() || undefined
        );
        alert(
          `¡Estadía extendida por ${extraNights} noche(s)!\n\nSe cobró $${additionalCost.toFixed(2)} en ${extendPayMethod === 'TR' ? 'Transferencia' : 'Efectivo'}.`
        );
        setIsExtendingStay(false);
        setExtraNights(1);
        setExtendNotes('');
      }
    } else {
      // OPCIÓN CLAVE: SIN REALIZAR AÚN EL PAGO / PAGAR OTRO DÍA
      if (
        window.confirm(
          `¿Confirmar que el cliente ${currentBooking.guestName} se hospedará ${extraNights} noche(s) más SIN REALIZAR AÚN EL PAGO?\n\nEl valor de $${additionalCost.toFixed(2)} quedará registrado como SALDO PENDIENTE para ser cobrado otro día o al momento de retirarse (Check-Out).`
        )
      ) {
        extendStay(
          selectedRoom.number,
          extraNights,
          false,
          undefined,
          undefined,
          extendNotes.trim() || undefined
        );
        alert(
          `¡Estadía extendida con éxito!\n\nSe añadieron ${extraNights} noche(s) a la cuenta de ${currentBooking.guestName}. El monto de $${additionalCost.toFixed(2)} quedó como SALDO PENDIENTE para pagar otro día o al salir.`
        );
        setIsExtendingStay(false);
        setExtraNights(1);
        setExtendNotes('');
      }
    }
  };

  const handleCheckout = (leaveClean: boolean = false) => {
    const msg = leaveClean
      ? `¿Confirmar Check-Out de la habitación ${selectedRoom.number} de ${currentBooking?.guestName}?\n\nLa habitación quedará marcada como LIMPIA.`
      : `¿Confirmar Check-Out de la habitación ${selectedRoom.number} de ${currentBooking?.guestName}?\n\nLa habitación quedará marcada AUTOMÁTICAMENTE como POR LIMPIAR.`;
    if (window.confirm(msg)) {
      checkOutRoom(selectedRoom.number, undefined, leaveClean);
      setSelectedRoom(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-mono-numbers font-black text-2xl text-white shadow-xs">
              {selectedRoom.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Habitación {selectedRoom.number}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {selectedRoom.floor}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
                <span>Tipo: <strong className="text-white">{selectedRoom.type}</strong></span>
                <span>·</span>
                {isSinglePriceRoom ? (
                  <span className="bg-blue-950 px-2.5 py-0.5 rounded border border-blue-800 font-mono-numbers text-emerald-300 font-bold">
                    Tarifa Única: <strong>${(selectedRoom.price2Persons || selectedRoom.price).toFixed(2)}</strong>
                  </span>
                ) : (
                  <>
                    <span className="bg-blue-950 px-2 py-0.5 rounded border border-blue-800 font-mono-numbers text-emerald-300">
                      1 Persona: <strong>${selectedRoom.price1Person.toFixed(2)}</strong>
                    </span>
                    <span className="bg-blue-950 px-2 py-0.5 rounded border border-blue-800 font-mono-numbers text-blue-300">
                      2 Personas: <strong>${selectedRoom.price2Persons.toFixed(2)}</strong>
                    </span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingPrices(!isEditingPrices)}
                  className="text-xs text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer"
                >
                  {isEditingPrices ? 'Cerrar edición' : '⚙️ Modificar Tarifas'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRoom(null)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panel de Edición de Tarifas de la Habitación */}
        {isEditingPrices && (
          <form onSubmit={handleSavePrices} className="bg-amber-50 p-4 border-b border-amber-200 text-xs">
            <h4 className="font-bold text-amber-900 mb-2">
              Configurar Tarifas Oficiales para Habitación {selectedRoom.number} ({selectedRoom.type}):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                  Precio por 1 Persona ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editPrice1}
                  onChange={e => setEditPrice1(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-amber-300 rounded bg-white font-mono-numbers"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                  Precio por 2 Personas ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editPrice2}
                  onChange={e => setEditPrice2(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-amber-300 rounded bg-white font-mono-numbers"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                  Persona Adicional ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editPriceExtra}
                  onChange={e => setEditPriceExtra(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-amber-300 rounded bg-white font-mono-numbers"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setIsEditingPrices(false)}
                className="px-3 py-1 rounded text-slate-600 bg-white border border-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded text-white bg-amber-700 hover:bg-amber-800 font-bold"
              >
                Guardar Nuevos Precios
              </button>
            </div>
          </form>
        )}

        {/* Housekeeping Quick Selector Bar - Solo dos opciones: LIMPIA o POR LIMPIAR */}
        <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Estado de Limpieza (2 Opciones):
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateRoomCleaning(selectedRoom.number, 'POR LIMPIAR')}
              className={`px-4 py-1.5 font-bold rounded-lg border transition-colors cursor-pointer text-xs ${
                selectedRoom.cleaningStatus === 'POR LIMPIAR' || selectedRoom.cleaningStatus === 'LIBRE' || selectedRoom.cleaningStatus === 'S' || selectedRoom.cleaningStatus === 'E' || selectedRoom.cleaningStatus === 'F'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              🧹 POR LIMPIAR
            </button>
            <button
              type="button"
              onClick={() => updateRoomCleaning(selectedRoom.number, 'LIMPIA')}
              className={`px-4 py-1.5 font-bold rounded-lg border transition-colors cursor-pointer text-xs ${
                selectedRoom.cleaningStatus === 'LIMPIA' || selectedRoom.cleaningStatus === 'L'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              ✨ LIMPIA
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* CASE 1: ROOM IS DISPONIBLE (V) -> CHECK-IN FORM */}
          {selectedRoom.status === 'V' && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {selectedRoom.number === '1' ? 'Habitación 1 (Deshabilitada)' : 'Registrar Nuevo Check-In'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedRoom.number === '1'
                      ? 'Esta habitación se encuentra fuera de servicio permanente.'
                      : 'Ingrese los datos del huésped para ingresar a la habitación.'}
                  </p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
                  selectedRoom.number === '1'
                    ? 'bg-slate-700 text-white border-slate-800'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}>
                  {selectedRoom.number === '1' ? '🚫 Deshabilitada' : 'V - Venta / Disponible'}
                </span>
              </div>

              {selectedRoom.number === '1' && (
                <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl mb-4 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900">Habitación 1 configurada como DESHABILITADA</p>
                    <p className="text-amber-800 mt-0.5">
                      Está fuera de servicio permanente por indicación de administración. Si en algún momento desea habilitarla para Check-In, cambie el estado de limpieza arriba a "L - Limpia".
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleCheckInSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre Completo del Huésped *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="Ej: Juan Carlos Pérez"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Cédula */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cédula / Pasaporte / DNI
                    </label>
                    <input
                      type="text"
                      value={guestDoc}
                      onChange={e => setGuestDoc(e.target.value)}
                      placeholder="Ej: 0928374615"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={e => setGuestPhone(e.target.value)}
                      placeholder="Ej: 0991234567"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Huéspedes y Tarifa según Personas */}
                  {isSinglePriceRoom ? (
                    <div className="sm:col-span-2 bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <label className="block text-xs font-bold text-blue-950">
                            Tarifa Única de la Habitación ({selectedRoom.type}):
                          </label>
                          <span className="text-[11px] text-blue-700 font-medium">
                            (Las habitaciones dobles, triples y cuádruples tienen un solo precio fijo)
                          </span>
                        </div>
                        <span className="text-sm font-mono-numbers font-black text-blue-900 bg-white px-3 py-1 rounded-lg border border-blue-300 shadow-2xs">
                          ${(selectedRoom.price2Persons || selectedRoom.price).toFixed(2)} / noche
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200 mt-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Número de Adultos (ADT)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={adults}
                            onChange={e => {
                              const num = Math.max(1, Number(e.target.value));
                              setAdults(num);
                              setPaidAmount(pricePerNight * nights);
                            }}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded font-mono-numbers font-bold text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Niños (NIÑ)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={children}
                            onChange={e => setChildren(Number(e.target.value))}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded font-mono-numbers font-bold text-center"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-blue-200/60 text-xs">
                        <span className="text-slate-600">Total noche hospedaje:</span>
                        <span className="font-semibold text-blue-950">
                          <strong className="font-mono-numbers font-black text-sm">${pricePerNight.toFixed(2)}</strong> / noche
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="sm:col-span-2 bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-blue-950">
                          Seleccionar Tarifa según Número de Huéspedes:
                        </label>
                        <span className="text-[11px] text-blue-700 font-medium">
                          (Ajusta automáticamente el precio por noche)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleAdultsChange(1)}
                          className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                            adults === 1
                              ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                              : 'bg-white text-slate-800 border-slate-300 hover:border-blue-400'
                          }`}
                        >
                          <span className="text-xs font-bold block">👤 1 Persona</span>
                          <span className={`text-sm font-mono-numbers font-black ${adults === 1 ? 'text-white' : 'text-blue-700'}`}>
                            ${selectedRoom.price1Person.toFixed(2)}
                          </span>
                          <span className="text-[10px] block opacity-80">Tarifa individual</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAdultsChange(2)}
                          className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                            adults === 2
                              ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                              : 'bg-white text-slate-800 border-slate-300 hover:border-blue-400'
                          }`}
                        >
                          <span className="text-xs font-bold block">👥 2 Personas</span>
                          <span className={`text-sm font-mono-numbers font-black ${adults === 2 ? 'text-white' : 'text-blue-700'}`}>
                            ${selectedRoom.price2Persons.toFixed(2)}
                          </span>
                          <span className="text-[10px] block opacity-80">Tarifa pareja / doble</span>
                        </button>

                        <div className="col-span-2 sm:col-span-1 bg-white p-2 rounded-lg border border-slate-300 flex items-center justify-between">
                          <div className="text-left">
                            <span className="text-[11px] font-bold text-slate-700 block">Personalizado</span>
                            <span className="text-[10px] text-slate-500">
                              (3+ pers: +${selectedRoom.priceExtraPerson || 15})
                            </span>
                          </div>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={adults}
                            onChange={e => handleAdultsChange(Number(e.target.value))}
                            className="w-14 px-2 py-1 text-xs border border-slate-300 rounded font-mono-numbers font-bold text-center"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-blue-200/60 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 font-semibold">Niños (NIÑ):</span>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={children}
                            onChange={e => setChildren(Number(e.target.value))}
                            className="w-14 px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono-numbers text-center"
                          />
                        </div>
                        <span className="font-semibold text-blue-900">
                          Tarifa seleccionada: <strong className="font-mono-numbers font-black text-sm">${pricePerNight.toFixed(2)}</strong> / noche
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Check-In Date & Time */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fecha Entrada (Check-In)
                    </label>
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      onChange={e => setCheckInDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hora Entrada
                    </label>
                    <input
                      type="time"
                      required
                      value={checkInTime}
                      onChange={e => setCheckInTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-numbers focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Check-Out Date & Time */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fecha Salida Prevista (Check-Out)
                    </label>
                    <input
                      type="date"
                      required
                      value={checkOutDate}
                      onChange={e => setCheckOutDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hora Salida
                    </label>
                    <input
                      type="time"
                      required
                      value={checkOutTime}
                      onChange={e => setCheckOutTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-numbers focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Tarifa y Noches */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Precio por Noche ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pricePerNight}
                      onChange={e => setPricePerNight(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-numbers focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Noches Calculadas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={nights}
                      onChange={e => {
                        const n = Number(e.target.value);
                        setNights(n);
                        setPaidAmount(n * pricePerNight);
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-numbers focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                    {/* Forma de Pago - Solo Efectivo o Transferencia */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Forma de Pago (E / TR) *
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-2 text-sm border-2 border-slate-300 focus:border-blue-600 rounded-lg focus:outline-none font-bold text-slate-800 bg-white"
                      >
                        <option value="E">💵 E = Efectivo</option>
                        <option value="TR">📱 TR = Transferencia Bancaria</option>
                      </select>
                    </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Monto Cobrado / Anticipo ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={paidAmount}
                      onChange={e => setPaidAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-numbers focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nº Factura / Recibo / Ref.
                    </label>
                    <input
                      type="text"
                      value={invoiceOrReceipt}
                      onChange={e => setInvoiceOrReceipt(e.target.value)}
                      placeholder="Ej: REC-00912"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Observaciones / Peticiones
                    </label>
                    <input
                      type="text"
                      value={observations}
                      onChange={e => setObservations(e.target.value)}
                      placeholder="Ej: Con vehículo, cama extra..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Resumen de cobro */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Total Hospedaje</span>
                    <span className="text-xl font-bold font-mono-numbers text-slate-900">
                      ${(pricePerNight * nights).toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Método de Pago</span>
                    <span className="text-sm font-bold text-blue-700">
                      {paymentMethod === 'E' ? 'Efectivo' : paymentMethod === 'TR' ? 'Transferencia' : paymentMethod === 'T' ? 'Tarjeta' : 'Otro'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedRoom(null)}
                    className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                  >
                    Completar Check-In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CASE 2: ROOM IS OCUPADA (O) -> GUEST DETAILS, CONSUMPTIONS, CHECKOUT */}
          {selectedRoom.status === 'O' && currentBooking && (
            <div className="space-y-6">
              {/* Header Info Banner */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                      Habitación Ocupada
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                    {currentBooking.guestName}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Doc: <span className="font-mono-numbers font-medium">{currentBooking.guestDoc || 'Sin doc'}</span> · Tel: <span className="font-mono-numbers font-medium">{currentBooking.guestPhone || 'Sin tel'}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <div className="text-right text-xs text-slate-600 space-y-0.5">
                    <p>Entrada: <span className="font-semibold text-slate-800">{currentBooking.checkInDate} {currentBooking.checkInTime}</span></p>
                    <p>Salida: <span className="font-semibold text-slate-800">{currentBooking.checkOutDate} {currentBooking.checkOutTime}</span></p>
                    <p>Huéspedes: <span className="font-semibold text-slate-800">{currentBooking.adults} Adt. {currentBooking.children > 0 ? `/ ${currentBooking.children} Niñ.` : ''}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOccupiedTab('cuenta');
                      setIsExtendingStay(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>+1 Día (Hospedarse Otro Día)</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex border-b border-slate-200 gap-2">
                <button
                  onClick={() => setOccupiedTab('cuenta')}
                  className={`pb-2 text-xs font-bold border-b-2 transition-colors ${
                    occupiedTab === 'cuenta'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Cuenta y Check-Out
                </button>
                <button
                  onClick={() => setOccupiedTab('consumos')}
                  className={`pb-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1 ${
                    occupiedTab === 'consumos'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  Bebidas y Snacks ({currentBooking.consumptions.length})
                </button>
              </div>

              {/* Tab 1: CUENTA Y CHECK-OUT */}
              {occupiedTab === 'cuenta' && (
                <div className="space-y-4">
                  {/* Desglose de Gastos */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    <div className="flex justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                      <span>Hospedaje ({currentBooking.nights} noche(s) × ${currentBooking.pricePerNight.toFixed(2)})</span>
                      <span className="font-mono-numbers font-semibold text-slate-900">${totalRoomBill.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                      <span>Consumos de Bebidas y Snacks ({currentBooking.consumptions.length} items)</span>
                      <span className="font-mono-numbers font-semibold text-slate-900">${totalSnacks.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                      <span>Total General Estadía</span>
                      <span className="font-mono-numbers text-base">${grandTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-emerald-700 pt-1 border-t border-slate-200">
                      <span>Monto Pagado / Anticipo</span>
                      <span className="font-mono-numbers font-semibold">-${alreadyPaid.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-baseline text-base font-extrabold pt-2 border-t border-slate-300">
                      <span className="text-slate-900">Saldo Pendiente a Pagar</span>
                      <span className={`font-mono-numbers ${balancePending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ${balancePending.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* CARD 1: EXTENDER ESTADÍA / HOSPEDARSE OTRO DÍA */}
                  <div className="bg-blue-50/80 rounded-xl border border-blue-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarPlus className="w-5 h-5 text-blue-700 shrink-0" />
                        <div>
                          <h5 className="text-xs font-bold text-blue-950 uppercase">
                            🏨 ¿El cliente desea hospedarse otro día?
                          </h5>
                          <p className="text-[11px] text-blue-800">
                            Añade noches adicionales con opción de pagar ahora o dejar para pagar otro día / al retirarse.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsExtendingStay(!isExtendingStay)}
                        className="px-3 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0"
                      >
                        {isExtendingStay ? 'Cerrar' : '+ Extender'}
                      </button>
                    </div>

                    {isExtendingStay && (
                      <div className="pt-3 border-t border-blue-200 space-y-3 animate-in fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Noches a Adicionar
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setExtraNights(Math.max(1, extraNights - 1))}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="30"
                                value={extraNights}
                                onChange={e => setExtraNights(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-16 text-center py-1 text-sm font-bold border border-slate-300 rounded-lg bg-white font-mono-numbers"
                              />
                              <button
                                type="button"
                                onClick={() => setExtraNights(extraNights + 1)}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Tarifa por Noche
                            </label>
                            <div className="py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-sm font-mono-numbers font-bold text-slate-800">
                              ${currentBooking.pricePerNight.toFixed(2)}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-blue-900 mb-1">
                              Total a Sumar (+{extraNights}n)
                            </label>
                            <div className="py-1.5 px-3 bg-blue-100 border border-blue-300 rounded-lg text-sm font-mono-numbers font-black text-blue-950">
                              ${(currentBooking.pricePerNight * extraNights).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Observación opcional de la extensión:
                          </label>
                          <input
                            type="text"
                            value={extendNotes}
                            onChange={e => setExtendNotes(e.target.value)}
                            placeholder="Ej: Huésped solicitó 1 noche más hasta mañana."
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                          />
                        </div>

                        {/* LAS 2 OPCIONES DE DECISIÓN DE PAGO */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {/* OPCIÓN SOLICITADA: SIN REALIZAR EL PAGO AHORA / PAGAR OTRO DÍA */}
                          <button
                            type="button"
                            onClick={() => handleExtendStaySubmit(false)}
                            className="p-3.5 rounded-xl border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-left transition-all cursor-pointer shadow-xs"
                          >
                            <span className="text-xs font-black text-amber-950 block">
                              🟡 Hospedarse Otro Día (Sin realizar pago ahora)
                            </span>
                            <span className="text-[11px] text-amber-800 block mt-1 leading-snug">
                              El cliente se queda y pagará otro día o al salir. Se adicionan <strong>${(currentBooking.pricePerNight * extraNights).toFixed(2)}</strong> como saldo pendiente.
                            </span>
                          </button>

                          {/* PAGAR AHORA */}
                          <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-2">
                            <span className="text-xs font-bold text-emerald-950 block">
                              🟢 Pagar Noche Adicional Ahora
                            </span>
                            <div className="flex items-center gap-2">
                              <select
                                value={extendPayMethod}
                                onChange={e => setExtendPayMethod(e.target.value as PaymentMethod)}
                                className="flex-1 px-2 py-1.5 text-xs border border-emerald-300 rounded-lg bg-white font-semibold"
                              >
                                <option value="E">💵 Efectivo</option>
                                <option value="TR">📱 Transferencia</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleExtendStaySubmit(true)}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap shadow-xs"
                              >
                                Cobrar ${(currentBooking.pricePerNight * extraNights).toFixed(2)}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CARD 2: COBRO DE HABITACIÓN Y CHECK-OUT (QUEDA AUTOMÁTICAMENTE POR LIMPIAR) */}
                  <div className="p-4 rounded-xl border-2 border-slate-300 bg-white space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 uppercase">
                          💳 Cobro de Habitación y Salida (Check-Out)
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Al cobrar y retirar al cliente, la habitación queda <strong>automáticamente marcada como POR LIMPIAR</strong>.
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono-numbers font-black border whitespace-nowrap ${
                        balancePending > 0
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}>
                        {balancePending > 0 ? `Saldo a Cobrar: $${balancePending.toFixed(2)}` : 'Cuenta Saldada: $0.00'}
                      </span>
                    </div>

                    {balancePending > 0 ? (
                      <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Forma de Pago del Cobro *
                            </label>
                            <select
                              value={checkoutPayMethod}
                              onChange={e => setCheckoutPayMethod(e.target.value as PaymentMethod)}
                              className="w-full px-3 py-2 text-xs border-2 border-slate-300 rounded-lg bg-white font-bold text-slate-900 focus:border-rose-500"
                            >
                              <option value="E">💵 Efectivo de Caja (Suma a gaveta)</option>
                              <option value="TR">📱 Transferencia Bancaria</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Nº Comprobante / Recibo (Opcional)
                            </label>
                            <input
                              type="text"
                              value={checkoutReceipt}
                              onChange={e => setCheckoutReceipt(e.target.value)}
                              placeholder="Ej: REC-1049"
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono-numbers"
                            />
                          </div>
                        </div>

                        {/* BOTÓN PRINCIPAL DE COBRO SOLICITADO */}
                        <button
                          type="button"
                          onClick={handleSettleAndCheckout}
                          className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>Cobrar Saldo de ${balancePending.toFixed(2)} y Check-Out (Queda Automáticamente POR LIMPIAR)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                          <span>Cuenta totalmente pagada ($0.00 pendiente). El huésped puede retirarse.</span>
                          <span className="font-bold text-emerald-950 font-mono-numbers">$0.00</span>
                        </div>

                        {/* BOTÓN CHECK-OUT AUTOMÁTICAMENTE POR LIMPIAR */}
                        <button
                          type="button"
                          onClick={() => handleCheckout(false)}
                          className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-amber-400" />
                          <span>Finalizar Estadía y Salida (Queda Automáticamente POR LIMPIAR)</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span>Forma de pago inicial registrada: <strong className="text-slate-700">{currentBooking.paymentMethod === 'TR' ? '📱 Transferencia' : '💵 Efectivo'}</strong></span>
                      <button
                        type="button"
                        onClick={() => handleCheckout(true)}
                        className="text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
                        title="Check-Out directo marcando la habitación como ya limpia"
                      >
                        Check-Out directo (Dejar LIMPIA)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: CONSUMOS DE BEBIDAS Y SNACKS */}
              {occupiedTab === 'consumos' && (
                <div className="space-y-4">
                  {/* Add Snack form */}
                  <form onSubmit={handleAddSnack} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800">
                      Agregar Consumo a la Habitación
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-slate-600 mb-0.5">Producto</label>
                        <select
                          value={selectedProductId}
                          onChange={e => setSelectedProductId(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} - ${p.price.toFixed(2)} (Stock: {p.stock})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={snackQty}
                          onChange={e => setSnackQty(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono-numbers"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="w-full py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Agregar
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={chargeToRoom}
                          onChange={e => setChargeToRoom(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-slate-700">Cargar a la cuenta de la habitación (pagar al checkout)</span>
                      </label>
                    </div>
                  </form>

                  {/* Consumptions List */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-800">
                      Consumos Registrados ({currentBooking.consumptions.length})
                    </h5>

                    {currentBooking.consumptions.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-3 text-center bg-slate-50 rounded-lg">
                        No hay consumos de bebidas o snacks cargados a esta habitación.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {currentBooking.consumptions.map(c => (
                          <div key={c.id} className="p-3 bg-white flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-slate-900">{c.productName}</p>
                              <p className="text-slate-500 text-[11px]">
                                {c.quantity} un. × ${c.unitPrice.toFixed(2)} · {c.isPaid ? 'Pagado' : 'Por pagar en checkout'}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-bold font-mono-numbers text-slate-900">
                                ${c.total.toFixed(2)}
                              </span>
                              <button
                                onClick={() => removeConsumption(c.id, currentBooking.id)}
                                title="Eliminar consumo"
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CASE 3: ROOM IS RESERVADA (R) -> VIEW RESERVATION & CHECK-IN NOW */}
          {selectedRoom.status === 'R' && currentBooking && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Reserva Confirmada
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  {currentBooking.guestName}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Llegada programada para: <span className="font-semibold">{currentBooking.checkInDate} a las {currentBooking.checkInTime}</span>
                </p>
                <p className="text-xs text-slate-600">
                  Anticipo pagado: <span className="font-mono-numbers font-semibold text-emerald-700">${currentBooking.paidAmount.toFixed(2)}</span> ({currentBooking.paymentMethod})
                </p>
                {currentBooking.observations && (
                  <p className="text-xs text-slate-500 mt-2 bg-white/70 p-2 rounded border border-emerald-100">
                    Nota: {currentBooking.observations}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Desea cancelar esta reserva?')) {
                      cancelReservation(currentBooking.id);
                      setSelectedRoom(null);
                    }
                  }}
                  className="px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Cancelar Reserva
                </button>
                <button
                  type="button"
                  onClick={() => {
                    convertReservationToCheckIn(currentBooking.id);
                    setSelectedRoom(null);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Efectuar Check-In Ahora (Huésped Llegó)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
