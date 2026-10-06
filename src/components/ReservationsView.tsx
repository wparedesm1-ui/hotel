import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Booking } from '../types/hotel';
import {
  CalendarDays,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Bed
} from 'lucide-react';

interface ReservationsViewProps {
  onOpenNewReservation: () => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({ onOpenNewReservation }) => {
  const {
    bookings,
    convertReservationToCheckIn,
    cancelReservation
  } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('reservada');

  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'todas' && b.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = b.guestName.toLowerCase().includes(q);
      const matchRoom = b.roomNumber.toLowerCase().includes(q);
      const matchDoc = b.guestDoc ? b.guestDoc.toLowerCase().includes(q) : false;
      return matchName || matchRoom || matchDoc;
    }
    return true;
  });

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'reservada':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Reserva Confirmada</span>;
      case 'activa':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Hospedado (Activo)</span>;
      case 'finalizada':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">Check-Out Realizado</span>;
      case 'cancelada':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">Cancelada</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Panel Administrativo de Reservas y Estadías
          </h2>
          <p className="text-xs text-slate-500">
            Gestiona reservas anticipadas, llegadas programadas y control de ingresos.
          </p>
        </div>

        <button
          onClick={onOpenNewReservation}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nueva Reserva
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por huésped, habitación o cédula..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto text-xs">
          {[
            { id: 'reservada', label: 'Reservas Pendientes' },
            { id: 'activa', label: 'Huéspedes Activos' },
            { id: 'finalizada', label: 'Historial Check-Out' },
            { id: 'todas', label: 'Todas las Registradas' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
                statusFilter === f.id
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="p-3">Hab.</th>
                <th className="p-3">Nombre del Huésped</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Fecha Entrada</th>
                <th className="p-3">Fecha Salida</th>
                <th className="p-3 text-center">Personas</th>
                <th className="p-3 text-right">Total Estancia</th>
                <th className="p-3 text-right">Anticipo / Pagado</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                    No se encontraron reservas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-900 font-mono-numbers font-bold text-xs">
                        {b.roomNumber}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{b.guestName}</div>
                      {b.observations && (
                        <span className="text-[10px] text-slate-500 line-clamp-1">
                          Nota: {b.observations}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 font-mono-numbers text-[11px]">
                      <div>{b.guestPhone || '—'}</div>
                      <div className="text-slate-400">{b.guestDoc || ''}</div>
                    </td>
                    <td className="p-3 font-mono-numbers text-[11px]">
                      <span className="font-semibold text-slate-800">{b.checkInDate}</span>
                      <span className="text-slate-500 block">{b.checkInTime}</span>
                    </td>
                    <td className="p-3 font-mono-numbers text-[11px]">
                      <span className="font-semibold text-slate-800">{b.checkOutDate}</span>
                      <span className="text-slate-500 block">{b.checkOutTime}</span>
                    </td>
                    <td className="p-3 text-center font-mono-numbers">
                      {b.adults} Adt. {b.children > 0 ? `/ ${b.children} Niñ.` : ''}
                    </td>
                    <td className="p-3 text-right font-mono-numbers font-bold text-slate-900">
                      ${b.roomTotal.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono-numbers font-bold text-emerald-700">
                      ${b.paidAmount.toFixed(2)}
                      <span className="text-[10px] text-slate-500 block font-normal">
                        ({b.paymentMethod === 'TR' ? 'Transferencia' : 'Efectivo'})
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {getStatusBadge(b.status)}
                    </td>
                    <td className="p-3 text-right">
                      {b.status === 'reservada' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => convertReservationToCheckIn(b.id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                            title="El huésped llegó, hacer Check-In"
                          >
                            Check-In
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Cancelar la reserva de ${b.guestName}?`)) {
                                cancelReservation(b.id);
                              }
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Cancelar reserva"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
