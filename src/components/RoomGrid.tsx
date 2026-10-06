import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { Room, RoomFloor, CleaningStatus, RoomStatus } from '../types/hotel';
import {
  Bed,
  Sparkles,
  AlertTriangle,
  Clock,
  Coffee,
  CheckCircle2,
  Wrench,
  Search,
  Filter
} from 'lucide-react';

export const RoomGrid: React.FC = () => {
  const { rooms, getRoomBooking, setSelectedRoom, resetRoomsCleanAndFree } = useHotel();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Metrics (Conteo exacto de LIMPIA y POR LIMPIAR)
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'O').length;
  const availableRooms = rooms.filter(r => r.status === 'V' && r.number !== '1').length;
  const reservedRooms = rooms.filter(r => r.status === 'R').length;
  const cleanRooms = rooms.filter(r => r.cleaningStatus === 'LIMPIA' || r.cleaningStatus === 'L').length;
  const porLimpiarRooms = rooms.filter(r => r.cleaningStatus === 'POR LIMPIAR' || r.cleaningStatus === 'LIBRE' || r.cleaningStatus === 'S' || r.cleaningStatus === 'E' || r.cleaningStatus === 'F').length;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  // Group rooms dynamically by Floor
  const floors = useMemo(() => {
    return Array.from(new Set(rooms.map(r => r.floor)));
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Status filter
      if (filterStatus === 'V' && room.status !== 'V') return false;
      if (filterStatus === 'O' && room.status !== 'O') return false;
      if (filterStatus === 'R' && room.status !== 'R') return false;
      if (filterStatus === 'limpia' && !(room.cleaningStatus === 'LIMPIA' || room.cleaningStatus === 'L')) return false;
      if (filterStatus === 'por_limpiar' && !(room.cleaningStatus === 'POR LIMPIAR' || room.cleaningStatus === 'LIBRE' || room.cleaningStatus === 'S' || room.cleaningStatus === 'E' || room.cleaningStatus === 'F')) return false;

      // Floor filter
      if (filterFloor !== 'all' && room.floor !== filterFloor) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const booking = getRoomBooking(room.number);
        const matchNumber = room.number.toLowerCase().includes(query);
        const matchType = room.type.toLowerCase().includes(query);
        const matchGuest = booking ? booking.guestName.toLowerCase().includes(query) : false;
        return matchNumber || matchType || matchGuest;
      }

      return true;
    });
  }, [rooms, filterStatus, filterFloor, searchQuery, getRoomBooking]);

  const getStatusBadge = (status: RoomStatus, cleaning: CleaningStatus) => {
    const isClean = cleaning === 'LIMPIA' || cleaning === 'L';
    switch (status) {
      case 'V':
        if (isClean) {
          return {
            label: 'V - Limpia',
            bg: 'bg-blue-600',
            text: 'text-white',
            border: 'border-blue-600'
          };
        }
        return {
          label: 'V - Por Limpiar',
          bg: 'bg-amber-600',
          text: 'text-white',
          border: 'border-amber-600'
        };
      case 'O':
        return {
          label: 'O - Ocupada',
          bg: 'bg-rose-600',
          text: 'text-white',
          border: 'border-rose-600'
        };
      case 'R':
        return {
          label: 'R - Reservada',
          bg: 'bg-emerald-600',
          text: 'text-white',
          border: 'border-emerald-600'
        };
    }
  };

  const getCleaningBadge = (status: CleaningStatus) => {
    if (status === 'LIMPIA' || status === 'L') {
      return { label: 'LIMPIA', color: 'text-emerald-700 bg-emerald-50 border-emerald-300 font-bold' };
    }
    return { label: 'POR LIMPIAR', color: 'text-amber-800 bg-amber-100 border-amber-300 font-bold' };
  };

  const getCategoryBadge = (type: string) => {
    switch (type) {
      case 'Sencilla':
        return 'bg-sky-50 text-sky-950 border-sky-300';
      case 'Doble':
        return 'bg-cyan-50 text-cyan-950 border-cyan-400 font-bold';
      case 'Triple':
        return 'bg-slate-50 text-slate-800 border-slate-300 font-bold';
      case 'Cuádruple':
        return 'bg-slate-50 text-slate-800 border-slate-300 font-bold';
      case 'Ejecutiva':
        return 'bg-amber-50 text-amber-950 border-amber-300 font-bold';
      case 'Premium':
        return 'bg-emerald-50 text-emerald-950 border-emerald-300 font-bold';
      case 'Suite':
        return 'bg-purple-50 text-purple-950 border-purple-300 font-bold';
      case 'Mini Suite':
        return 'bg-violet-50 text-violet-950 border-violet-200 font-bold';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Habitaciones</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono-numbers text-slate-900">{totalRooms}</span>
            <span className="text-xs text-slate-400">100%</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-blue-700">Disponibles (V)</p>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono-numbers text-blue-800">{availableRooms}</span>
            <span className="text-xs font-medium text-blue-600">{Math.round((availableRooms / totalRooms) * 100)}%</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-rose-700">Ocupadas (O)</p>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono-numbers text-rose-800">{occupiedRooms}</span>
            <span className="text-xs font-medium text-rose-600">{occupancyRate}%</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-700">Reservadas (R)</p>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono-numbers text-emerald-800">{reservedRooms}</span>
            <span className="text-xs font-medium text-emerald-600">{Math.round((reservedRooms / totalRooms) * 100)}%</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/40 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-800">✨ LIMPIAS</p>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono-numbers text-emerald-900">{cleanRooms}</span>
            <span className="text-xs font-medium text-emerald-700">Listas para Venta</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-300 bg-amber-50/50 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-900">🧹 POR LIMPIAR</p>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono-numbers text-amber-950">{porLimpiarRooms}</span>
            <span className="text-xs font-medium text-amber-800">Pendientes de aseo</span>
          </div>
        </div>
      </div>

      {/* Legend & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        {/* Leyenda visual directa de la hoja */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Leyenda Estados:</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-600 text-white font-medium">
              R = Reservado
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-600 text-white font-medium">
              V = Venta / Disponible
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-600 text-white font-medium">
              O = Ocupado
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Limpieza (2 Opciones):</span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">LIMPIA</span>
            <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">POR LIMPIAR</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Nº hab, tipo o huésped..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Quick Action: Dejar Todas Libres y Limpias */}
            <button
              onClick={() => {
                if (window.confirm('¿Deseas dejar las 44 habitaciones TODAS LIBRES Y LIMPIAS para realizar tus ejercicios de prueba?')) {
                  resetRoomsCleanAndFree();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Restablecer todas las habitaciones a Libres y Limpias para ejercicios"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dejar Todas Libres y Limpias (Ejercicios)</span>
            </button>

            {/* Filter buttons */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({rooms.length})
              </button>
              <button
                onClick={() => setFilterStatus('V')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterStatus === 'V' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disponibles ({availableRooms})
              </button>
              <button
                onClick={() => setFilterStatus('O')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterStatus === 'O' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ocupadas ({occupiedRooms})
              </button>
              <button
                onClick={() => setFilterStatus('R')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterStatus === 'R' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reservadas ({reservedRooms})
              </button>
              <button
                onClick={() => setFilterStatus('limpia')}
                className={`px-3 py-1 font-bold rounded-md transition-colors ${
                  filterStatus === 'limpia' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                LIMPIA ({cleanRooms})
              </button>
              <button
                onClick={() => setFilterStatus('por_limpiar')}
                className={`px-3 py-1 font-bold rounded-md transition-colors ${
                  filterStatus === 'por_limpiar' ? 'bg-amber-500 text-white shadow-2xs' : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                POR LIMPIAR ({porLimpiarRooms})
              </button>
            </div>

            {/* Floor filter */}
            <select
              value={filterFloor}
              onChange={e => setFilterFloor(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">Todos los Pisos</option>
              {floors.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Room Grids separated by Floor */}
      <div className="space-y-8">
        {floors.map(floorName => {
          const floorRooms = filteredRooms.filter(r => r.floor === floorName);
          if (floorRooms.length === 0) return null;

          return (
            <div key={floorName} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">
                    {floorName}
                  </h3>
                  <span className="text-xs text-slate-400">
                    ({floorRooms.length} habitaciones)
                  </span>
                </div>
              </div>

              {/* Grid of Room Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {floorRooms.map(room => {
                  const booking = getRoomBooking(room.number);
                  const statusStyle = getStatusBadge(room.status, room.cleaningStatus);
                  const cleaningStyle = getCleaningBadge(room.cleaningStatus);
                  const isDisabledRoom = room.number === '1' || room.notes?.includes('DESHABILITADA');
                  const isSinglePrice = room.hasSinglePrice || ['Doble', 'Triple', 'Cuádruple'].includes(room.type);

                  const totalConsumptions = booking
                    ? booking.consumptions.reduce((sum, c) => sum + c.total, 0)
                    : 0;
                  const consumptionCount = booking ? booking.consumptions.length : 0;

                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`group relative text-left p-4 rounded-xl border transition-all duration-150 hover:shadow-md cursor-pointer ${
                        isDisabledRoom
                          ? 'bg-slate-100 border-slate-300 hover:border-slate-400 opacity-90'
                          : room.status === 'O'
                          ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400'
                          : room.status === 'R'
                          ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400'
                          : 'bg-white border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      {/* Top Header: Room number & Price */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black font-mono-numbers text-slate-900 group-hover:text-blue-600 transition-colors">
                              {room.number}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getCategoryBadge(room.type)}`}>
                              {room.type}
                            </span>
                          </div>
                          {isSinglePrice ? (
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono-numbers">
                              <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-bold">
                                Tarifa única: <strong className="text-blue-950 font-black">${(room.price2Persons || room.price).toFixed(2)}</strong>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono-numbers">
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                1 Pers: <strong className="text-blue-800">${room.price1Person.toFixed(2)}</strong>
                              </span>
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                2 Pers: <strong className="text-blue-800">${room.price2Persons.toFixed(2)}</strong>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Status badge V / O / R or DESHABILITADA */}
                        {isDisabledRoom ? (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-slate-700 text-white shadow-2xs">
                            🚫 Deshabilitada
                          </span>
                        ) : (
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-md shadow-2xs ${statusStyle.bg} ${statusStyle.text}`}
                          >
                            {statusStyle.label}
                          </span>
                        )}
                      </div>

                      {/* Middle: Guest information or availability */}
                      <div className="mt-3 pt-3 border-t border-slate-100 min-h-[50px] flex flex-col justify-center">
                        {isDisabledRoom ? (
                          <div className="text-xs font-semibold text-slate-500 italic">
                            Habitación 1 fuera de servicio permanente.
                          </div>
                        ) : room.status === 'O' && booking ? (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {booking.guestName}
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>Salida: {booking.checkOutDate}</span>
                              <span className="font-medium text-slate-700">{booking.adults} Adt.</span>
                            </div>
                            {consumptionCount > 0 && (
                              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <Coffee className="w-3 h-3" />
                                <span>{consumptionCount} consumo(s): ${totalConsumptions.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        ) : room.status === 'R' && booking ? (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-emerald-900 truncate">
                              Reserva: {booking.guestName}
                            </p>
                            <p className="text-[11px] text-emerald-700">
                              Llegada hoy a las {booking.checkInTime}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-blue-600 font-medium">
                            <span>Disponible para Check-In</span>
                            <span className="text-[11px] text-slate-400">Clic para asignar</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer: Housekeeping badge & notes */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span
                          className={`px-2 py-0.5 text-[11px] rounded border ${cleaningStyle.color}`}
                        >
                          {isDisabledRoom ? 'F - Fuera de serv.' : cleaningStyle.label}
                        </span>

                        <span className="text-[11px] text-slate-500 group-hover:text-blue-600 transition-colors font-medium">
                          Gestionar →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
