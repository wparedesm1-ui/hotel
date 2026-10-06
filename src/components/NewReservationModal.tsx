import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { PaymentMethod } from '../types/hotel';
import { X, Calendar, User, Phone, DollarSign } from 'lucide-react';

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({ isOpen, onClose }) => {
  const { rooms, createReservation } = useHotel();

  if (!isOpen) return null;

  // Filter available rooms or allow future booking
  const availableRooms = rooms.filter(r => r.status === 'V');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [selectedRoomNumber, setSelectedRoomNumber] = useState(
    availableRooms[0]?.number || rooms[0]?.number || '101'
  );
  const [guestName, setGuestName] = useState('');
  const [guestDoc, setGuestDoc] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkInTime, setCheckInTime] = useState('15:00');
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [checkOutTime, setCheckOutTime] = useState('12:00');
  const [advancePaid, setAdvancePaid] = useState('20.00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TR');
  const [observations, setObservations] = useState('');

  const selectedRoomObj = rooms.find(r => r.number === selectedRoomNumber);
  const isSingle = selectedRoomObj?.hasSinglePrice || ['Doble', 'Triple', 'Cuádruple'].includes(selectedRoomObj?.type || '');
  const pricePerNight = selectedRoomObj
    ? isSingle
      ? (selectedRoomObj.price2Persons || selectedRoomObj.price)
      : adults === 1
      ? selectedRoomObj.price1Person
      : adults === 2
      ? selectedRoomObj.price2Persons
      : selectedRoomObj.price2Persons + (adults - 2) * (selectedRoomObj.priceExtraPerson || 15)
    : 30;

  const d1 = new Date(checkInDate);
  const d2 = new Date(checkOutDate);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const nights = diffDays > 0 ? diffDays : 1;
  const totalStay = pricePerNight * nights;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('Ingrese el nombre del huésped');
      return;
    }

    createReservation({
      roomNumber: selectedRoomNumber,
      guestName: guestName.trim(),
      guestDoc: guestDoc.trim(),
      guestPhone: guestPhone.trim(),
      adults: Number(adults),
      children: Number(children),
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      pricePerNight,
      nights,
      paymentMethod,
      observations: observations.trim(),
      advancePaid: parseFloat(advancePaid) || 0
    });

    onClose();
    alert(`¡Reserva creada exitosamente para ${guestName} en habitación ${selectedRoomNumber}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Crear Nueva Reserva de Habitación
            </h3>
            <p className="text-xs text-slate-500">
              Registra una reserva anticipada con seña/anticipo.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Habitación
              </label>
              <select
                value={selectedRoomNumber}
                onChange={e => setSelectedRoomNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {rooms.map(r => {
                  const isSingle = r.hasSinglePrice || ['Doble', 'Triple', 'Cuádruple'].includes(r.type);
                  const priceLabel = isSingle
                    ? `Tarifa única: $${(r.price2Persons || r.price).toFixed(0)}`
                    : `1p: $${r.price1Person.toFixed(0)} | 2p: $${r.price2Persons.toFixed(0)}`;
                  return (
                    <option key={r.id} value={r.number} disabled={r.number === '1'}>
                      Hab. {r.number} - {r.type} ({priceLabel}) [{r.floor}] {r.number === '1' ? '🚫 DESHABILITADA' : `· ${r.status === 'V' ? 'Libre' : r.status === 'O' ? 'Ocupada' : 'Reservada'}`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Huésped *
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="Ej: Gabriela Torres"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cédula / Documento
              </label>
              <input
                type="text"
                value={guestDoc}
                onChange={e => setGuestDoc(e.target.value)}
                placeholder="Ej: 0918273645"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={e => setGuestPhone(e.target.value)}
                placeholder="Ej: 0998877665"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Llegada
              </label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={e => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hora de Llegada Aprox.
              </label>
              <input
                type="time"
                value={checkInTime}
                onChange={e => setCheckInTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono-numbers"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Salida
              </label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={e => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hora de Salida
              </label>
              <input
                type="time"
                value={checkOutTime}
                onChange={e => setCheckOutTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono-numbers"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Anticipo / Seña Pagada ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={advancePaid}
                onChange={e => setAdvancePaid(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono-numbers"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Método de Pago del Anticipo
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="TR">📱 Transferencia Bancaria</option>
                <option value="E">💵 Efectivo</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observaciones
              </label>
              <input
                type="text"
                value={observations}
                onChange={e => setObservations(e.target.value)}
                placeholder="Ej: Reserva telefónica, solicita cama matrimonial..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-xs border border-slate-200">
            <div>
              <span className="text-slate-500 block">Total Estadía ({nights} noche(s)):</span>
              <span className="font-bold text-slate-900 font-mono-numbers text-sm">
                ${totalStay.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Saldo a pagar a la llegada:</span>
              <span className="font-bold text-emerald-700 font-mono-numbers text-sm">
                ${Math.max(0, totalStay - (parseFloat(advancePaid) || 0)).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
            >
              Guardar Reserva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
