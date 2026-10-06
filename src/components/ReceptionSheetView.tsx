import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Room } from '../types/hotel';
import { Bed, Printer, LayoutGrid, Table, FileSpreadsheet } from 'lucide-react';

export const ReceptionSheetView: React.FC = () => {
  const {
    rooms,
    getRoomBooking,
    activeShift,
    setSelectedRoom,
    updateRoomCleaning,
    exportDailySalesToExcel
  } = useHotel();

  const [viewMode, setViewMode] = useState<'operativa' | 'cuadricula'>('operativa');
  const [generalNotes, setGeneralNotes] = useState(
    'Piso 2 en revisión de luces pasillo. Todas las llaves maestras en recepción.'
  );
  const [roomNotes, setRoomNotes] = useState(
    'Hab 10 reportó cerradura ya reparada. Hab 1 deshabilitada fuera de servicio permanente.'
  );

  const occupiedCount = rooms.filter(r => r.status === 'O').length;
  const availableCount = rooms.filter(r => r.status === 'V' && r.number !== '1').length;
  const reservedCount = rooms.filter(r => r.status === 'R').length;
  const limpiasCount = rooms.filter(r => r.cleaningStatus === 'LIMPIA' || r.cleaningStatus === 'L').length;
  const porLimpiarCount = rooms.filter(r => r.cleaningStatus === 'POR LIMPIAR' || r.cleaningStatus === 'LIBRE' || r.cleaningStatus === 'S' || r.cleaningStatus === 'E' || r.cleaningStatus === 'F').length;
  const totalCount = rooms.length;

  const floorNames = Array.from(new Set(rooms.map(r => r.floor)));
  const floorBgMap: Record<string, string> = {
    'PLANTA BAJA': 'bg-blue-50/50',
    'PRIMER PISO': 'bg-amber-50/50',
    'SEGUNDO PISO': 'bg-emerald-50/50',
    'TERCER PISO': 'bg-purple-50/50',
    'GARAJES': 'bg-indigo-50/50'
  };
  const floors = floorNames.map(name => ({
    name,
    bgClass: floorBgMap[name] || 'bg-slate-50/50'
  }));

  const getCategoryBadge = (type: string) => {
    switch (type) {
      case 'Sencilla':
        return 'bg-sky-100 text-sky-950 border-sky-300';
      case 'Doble':
        return 'bg-cyan-100 text-cyan-950 border-cyan-400 font-bold';
      case 'Triple':
        return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
      case 'Cuádruple':
        return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
      case 'Ejecutiva':
        return 'bg-amber-100 text-amber-950 border-amber-400 font-bold';
      case 'Premium':
        return 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold';
      case 'Suite':
        return 'bg-purple-100 text-purple-950 border-purple-400 font-bold';
      case 'Mini Suite':
        return 'bg-violet-50 text-violet-950 border-violet-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriceLabel = (room: Room) => {
    if (room.hasSinglePrice || ['Doble', 'Triple', 'Cuádruple'].includes(room.type) || room.price1Person === room.price2Persons) {
      return `${(room.price2Persons || room.price).toFixed(0)}`;
    }
    return `${room.price1Person.toFixed(0)}–${room.price2Persons.toFixed(0)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  // Group rooms for the official 4-block layout matching the photo
  const plantaBajaRooms = rooms.filter(r => r.floor === 'PLANTA BAJA');
  const segundoPisoRooms = rooms.filter(r => r.floor === 'SEGUNDO PISO');
  const primerPisoRooms = rooms.filter(r => r.floor === 'PRIMER PISO');
  const garajesRooms = rooms.filter(r => r.floor === 'GARAJES');

  return (
    <div className="space-y-4">
      {/* Action Header (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Planilla de Control Diario de Check-In / Check-Out
          </h2>
          <p className="text-xs text-slate-500">
            Formato oficial y actualizado con las tarifas revisadas. Columnas "N HB", "N HUESP.", "HORA LIBER." y "RESERVA/FACTURA" eliminadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewMode('operativa')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'operativa'
                  ? 'bg-white text-blue-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Planilla Diaria
            </button>
            <button
              onClick={() => setViewMode('cuadricula')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'cuadricula'
                  ? 'bg-white text-blue-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Formato 4 Bloques (Foto)
            </button>
          </div>

          <button
            onClick={() => exportDailySalesToExcel(activeShift.date)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            title="Descargar archivo Excel (.csv con formato oficial) de todas las ventas del día"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Generar Excel de Ventas</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir Hoja
          </button>
        </div>
      </div>

      {/* VIEW 1: PLANILLA DIARIA (OPERATIVA) - WITHOUT N HB, N HUESP, HORA LIBER, RESERVA/FACTURA */}
      {viewMode === 'operativa' && (
        <div className="bg-white border-2 border-blue-950 rounded-lg shadow-md p-4 lg:p-6 overflow-x-auto text-[11px] leading-tight text-slate-900">
          {/* Sheet Top Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pb-3 border-b-2 border-blue-950 items-center">
            {/* Logo Box */}
            <div className="md:col-span-3 bg-blue-900 text-white p-3 rounded flex items-center gap-3">
              <Bed className="w-8 h-8 text-white shrink-0" />
              <div>
                <h1 className="text-xl font-black tracking-tight leading-none">HOTEL</h1>
                <p className="text-[10px] text-blue-200 mt-1 font-medium">
                  Tu descanso, nuestra prioridad
                </p>
              </div>
            </div>

            {/* Sheet Title */}
            <div className="md:col-span-5 text-center">
              <h2 className="text-xl lg:text-2xl font-black text-blue-950 tracking-wide uppercase">
                CONTROL DE CHECK-IN / CHECK-OUT
              </h2>
            </div>

            {/* Top Right Shift Box */}
            <div className="md:col-span-4 border border-blue-900 rounded p-2 text-[10px] space-y-1 bg-slate-50">
              <div className="flex justify-between items-center border-b border-blue-200 pb-0.5">
                <span className="font-bold text-blue-950">FECHA:</span>
                <span className="font-mono-numbers font-semibold">{activeShift.date}</span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-200 pb-0.5">
                <span className="font-bold text-blue-950">RECEPCIONISTA:</span>
                <span className="font-semibold text-slate-800">{activeShift.receptionistName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-200 pb-0.5">
                <span className="font-bold text-blue-950">TURNO ANTERIOR:</span>
                <span className="text-slate-700">{activeShift.previousShiftReceptionist || 'Elena Torres'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-950">TURNO ACTUAL:</span>
                <span className="font-semibold text-blue-800">{activeShift.name}</span>
              </div>
            </div>
          </div>

          {/* Legend Boxes Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 my-3">
            {/* Leyenda Estados */}
            <div className="border border-blue-900 rounded p-2 bg-blue-50/20">
              <p className="font-bold text-blue-950 text-[10px] mb-1 uppercase">
                LEYENDA DE ESTADOS DE HABITACIÓN:
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 font-bold">
                  <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px]">R</span>
                  <span>= Reservado</span>
                </span>
                <span className="inline-flex items-center gap-1 font-bold">
                  <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[10px]">V</span>
                  <span>= Venta / Disp.</span>
                </span>
                <span className="inline-flex items-center gap-1 font-bold">
                  <span className="w-4 h-4 rounded bg-rose-600 text-white flex items-center justify-center text-[10px]">O</span>
                  <span>= Ocupado</span>
                </span>
              </div>
            </div>

            {/* Leyenda Limpieza (2 Opciones: LIMPIA o POR LIMPIAR) */}
            <div className="border border-blue-900 rounded p-2 bg-blue-50/20">
              <p className="font-bold text-blue-950 text-[10px] mb-1 uppercase">
                ESTADO DE LIMPIEZA (2 OPCIONES):
              </p>
              <div className="flex items-center gap-2 flex-wrap text-[10px]">
                <span className="inline-flex items-center gap-1 font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px]">LIMPIA</span>
                  <span>= Habitación lista</span>
                </span>
                <span className="inline-flex items-center gap-1 font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px]">POR LIMPIAR</span>
                  <span>= Pendiente aseo</span>
                </span>
              </div>
            </div>

            {/* Forma de Pago (Solo dos opciones: Efectivo o Transferencia) */}
            <div className="border border-blue-900 rounded p-2 bg-blue-50/20">
              <p className="font-bold text-blue-950 text-[10px] mb-1 uppercase">
                FORMA DE PAGO (2 OPCIONES):
              </p>
              <div className="grid grid-cols-2 gap-1 text-[10px] font-semibold">
                <span>E = Efectivo</span>
                <span>TR = Transferencia</span>
              </div>
            </div>
          </div>

          {/* Master Control Table - REMOVED: HB, Nº HUÉSP., HORA LIBER., RESERVA / FACTURA */}
          <div className="overflow-x-auto border-2 border-blue-950">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-blue-950 text-white text-[10px] text-center font-bold tracking-tight uppercase">
                  <th className="border border-blue-800 p-1.5 w-28">PISO / UBICACIÓN</th>
                  <th className="border border-blue-800 p-1.5 w-16">Nº HAB.</th>
                  <th className="border border-blue-800 p-1.5 w-28">TIPO DE HABITACIÓN</th>
                  <th className="border border-blue-800 p-1.5 w-24">
                    PRECIO $
                    <div className="text-[8px] font-normal border-t border-blue-800 mt-0.5">1p / 2p</div>
                  </th>
                  <th className="border border-blue-800 p-1.5 w-20">ESTADO</th>
                  <th className="border border-blue-800 p-1.5">NOMBRE DEL HUÉSPED</th>
                  <th className="border border-blue-800 p-1.5 w-28">
                    CHECK-IN
                    <div className="flex border-t border-blue-800 text-[9px] mt-0.5">
                      <span className="w-1/2">FECHA</span>
                      <span className="w-1/2 border-l border-blue-800">HORA</span>
                    </div>
                  </th>
                  <th className="border border-blue-800 p-1.5 w-28">
                    CHECK-OUT
                    <div className="flex border-t border-blue-800 text-[9px] mt-0.5">
                      <span className="w-1/2">FECHA</span>
                      <span className="w-1/2 border-l border-blue-800">HORA</span>
                    </div>
                  </th>
                  <th className="border border-blue-800 p-1.5 w-14">LIMP</th>
                  <th className="border border-blue-800 p-1.5 w-16">FORMA PAGO</th>
                  <th className="border border-blue-800 p-1.5 w-48">OBSERVACIONES</th>
                </tr>
              </thead>
              <tbody>
                {floors.map(({ name: floorName, bgClass }) => {
                  const floorRooms = rooms.filter(r => r.floor === floorName);
                  if (floorRooms.length === 0) return null;

                  return (
                    <React.Fragment key={floorName}>
                      {floorRooms.map((room, idx) => {
                        const booking = getRoomBooking(room.number);

                        return (
                          <tr
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className="hover:bg-blue-50/80 cursor-pointer border-b border-blue-900 text-[10px] transition-colors"
                          >
                            {/* Floor cell spans rows */}
                            {idx === 0 && (
                              <td
                                rowSpan={floorRooms.length}
                                className={`border-r-2 border-blue-950 font-black text-center p-2 uppercase tracking-wider align-middle ${bgClass} text-slate-900`}
                              >
                                {floorName}
                              </td>
                            )}

                            {/* Nº HAB. (Único número de habitación) */}
                            <td className="border-r border-blue-900 text-center font-black font-mono-numbers text-slate-900 text-xs py-1">
                              {room.number}
                            </td>

                            {/* TIPO */}
                            <td className="border-r border-blue-900 px-1.5 py-1 text-center">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(room.type)}`}>
                                {room.type}
                              </span>
                            </td>

                            {/* PRECIO (1p / 2p) - ACTUALIZADO CON LOS VALORES OFICIALES */}
                            <td className="border-r border-blue-900 text-center px-1 font-mono-numbers text-[10px] font-bold whitespace-nowrap text-blue-950">
                              {getPriceLabel(room)}
                            </td>

                            {/* ESTADO (R, V, O) - Colored badge */}
                            <td className="border-r border-blue-900 text-center p-0.5">
                              {room.number === '1' ? (
                                <span className="inline-block w-full py-0.5 font-bold text-white rounded text-[9px] bg-slate-700">
                                  DESH.
                                </span>
                              ) : (
                                <span
                                  className={`inline-block w-full py-0.5 font-bold text-white rounded text-[10px] ${
                                    room.status === 'V'
                                      ? 'bg-blue-600'
                                      : room.status === 'O'
                                      ? 'bg-rose-600'
                                      : 'bg-emerald-600'
                                  }`}
                                >
                                  {room.status}
                                </span>
                              )}
                            </td>

                            {/* NOMBRE DEL HUÉSPED */}
                            <td className="border-r border-blue-900 px-2 font-medium truncate max-w-[180px]">
                              {booking ? (
                                <span className={room.status === 'O' ? 'font-bold text-slate-900' : 'text-emerald-800'}>
                                  {booking.guestName}
                                </span>
                              ) : (
                                <span className="text-slate-300 italic">—</span>
                              )}
                            </td>

                            {/* CHECK-IN (FECHA / HORA) */}
                            <td className="border-r border-blue-900 text-center font-mono-numbers text-[9px]">
                              {booking ? `${booking.checkInDate.slice(5)} ${booking.checkInTime}` : '—'}
                            </td>

                            {/* CHECK-OUT (FECHA / HORA) */}
                            <td className="border-r border-blue-900 text-center font-mono-numbers text-[9px]">
                              {booking ? `${booking.checkOutDate.slice(5)} ${booking.checkOutTime}` : '—'}
                            </td>

                            {/* LIMP - SOLO DOS OPCIONES: LIMPIA O POR LIMPIAR */}
                            <td className="border-r border-blue-900 text-center font-bold">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-black tracking-tight ${
                                  room.cleaningStatus === 'LIMPIA' || room.cleaningStatus === 'L'
                                    ? 'text-emerald-800 bg-emerald-100 border border-emerald-300'
                                    : 'text-amber-800 bg-amber-100 border border-amber-300'
                                }`}
                              >
                                {room.cleaningStatus === 'LIMPIA' || room.cleaningStatus === 'L' ? 'LIMPIA' : 'POR LIMPIAR'}
                              </span>
                            </td>

                            {/* FORMA DE PAGO - SOLO DOS OPCIONES: EFECTIVO (E) O TRANSFERENCIA (TR) */}
                            <td className="border-r border-blue-900 text-center font-bold text-slate-800">
                              {booking ? (
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${
                                  booking.paymentMethod === 'TR'
                                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                }`}>
                                  {booking.paymentMethod === 'TR' ? 'TR' : 'E'}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* OBSERVACIONES */}
                            <td className="px-2 text-[9px] text-slate-600 truncate max-w-[180px]">
                              {booking?.observations || room.notes || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Resumen & Observaciones Footer */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3 pt-3 border-t-2 border-blue-950">
            {/* Resumen de Habitaciones */}
            <div className="md:col-span-3 border border-blue-900 rounded p-2.5 bg-blue-50/20 text-[10px] space-y-1.5">
              <p className="font-bold text-blue-950 uppercase border-b border-blue-200 pb-1">
                RESUMEN DE HABITACIONES
              </p>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Habitaciones ocupadas:</span>
                <span className="font-mono-numbers font-bold text-rose-700 text-xs">{occupiedCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Habitaciones disponibles:</span>
                <span className="font-mono-numbers font-bold text-blue-700 text-xs">{availableCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Habitaciones reservadas:</span>
                <span className="font-mono-numbers font-bold text-emerald-700 text-xs">{reservedCount}</span>
              </div>
              <div className="flex justify-between items-center border-t border-blue-200 pt-1 font-bold">
                <span className="text-slate-900">Total de habitaciones:</span>
                <span className="font-mono-numbers text-xs">{totalCount}</span>
              </div>
            </div>

            {/* Observaciones Generales */}
            <div className="md:col-span-3 border border-blue-900 rounded p-2 bg-yellow-50/20 text-[10px]">
              <p className="font-bold text-blue-950 uppercase mb-1">
                OBSERVACIONES GENERALES:
              </p>
              <textarea
                value={generalNotes}
                onChange={e => setGeneralNotes(e.target.value)}
                rows={3}
                className="w-full bg-transparent border-none text-[10px] text-slate-700 resize-none focus:outline-none"
              />
            </div>

            {/* Observaciones Por Habitación */}
            <div className="md:col-span-3 border border-blue-900 rounded p-2 bg-slate-50 text-[10px]">
              <p className="font-bold text-blue-950 uppercase mb-1">
                OBSERVACIONES POR HABITACIÓN:
              </p>
              <textarea
                value={roomNotes}
                onChange={e => setRoomNotes(e.target.value)}
                rows={3}
                className="w-full bg-transparent border-none text-[10px] text-slate-700 resize-none focus:outline-none"
              />
            </div>

            {/* Firma del Recepcionista */}
            <div className="md:col-span-3 border border-blue-900 rounded p-2 flex flex-col justify-end items-center text-center bg-slate-50">
              <div className="w-3/4 border-b border-slate-700 mb-1">
                <span className="font-serif italic text-slate-600 block text-xs">
                  {activeShift.receptionistName}
                </span>
              </div>
              <p className="font-bold text-blue-950 text-[10px] uppercase">
                FIRMA DEL RECEPCIONISTA
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FORMATO 4 BLOQUES (RÉPLICA EXACTA DE LA FOTO OFICIAL SUBIDA) */}
      {viewMode === 'cuadricula' && (
        <div className="bg-white border-2 border-slate-800 rounded-lg shadow-md p-4 lg:p-6 overflow-x-auto text-[11px] leading-tight text-slate-900">
          <div className="border-b-2 border-slate-900 pb-2 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black uppercase text-slate-900 tracking-wider">
                HOJA DE CONTROL Y TARIFAS DE HABITACIONES (FORMATO OFICIAL)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Distribución en 4 bloques: Planta Baja, Segundo Piso, Primer Piso y Garajes con tarifas oficiales y casillas R · V · O.
              </p>
            </div>
            <div className="text-right text-[11px] font-mono-numbers">
              <p>Fecha: <strong>{activeShift.date}</strong></p>
              <p>Turno: <strong>{activeShift.name}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* BLOQUE SUPERIOR IZQUIERDO: PLANTA BAJA */}
            <div className="border border-slate-700 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-700 text-slate-800 font-bold text-center">
                    <th className="p-1 w-8 border-r border-slate-400">Nº</th>
                    <th className="p-1 w-24 border-r border-slate-400">Tipo</th>
                    <th className="p-1 w-16 border-r border-slate-400">Tarifa</th>
                    <th className="p-1 w-7 border-r border-slate-400 bg-emerald-50 text-emerald-900">R</th>
                    <th className="p-1 w-7 border-r border-slate-400 bg-blue-50 text-blue-900">V</th>
                    <th className="p-1 w-7 bg-rose-50 text-rose-900">O</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {plantaBajaRooms.map(room => (
                    <tr
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className="hover:bg-blue-50 cursor-pointer font-medium"
                    >
                      <td className="p-1 text-center font-bold font-mono-numbers border-r border-slate-300">
                        {room.number}
                      </td>
                      <td className={`p-1 border-r border-slate-300 font-semibold ${
                        room.type === 'Sencilla' ? 'bg-slate-50' :
                        room.type === 'Doble' ? 'bg-cyan-100' :
                        room.type === 'Ejecutiva' ? 'bg-amber-100' :
                        room.type === 'Suite' ? 'bg-purple-100' :
                        room.type === 'Premium' ? 'bg-emerald-100' : ''
                      }`}>
                        {room.type} {room.number === '1' && <span className="text-[9px] text-rose-700 font-black">(Desh)</span>}
                      </td>
                      <td className="p-1 text-center font-mono-numbers border-r border-slate-300 font-bold">
                        {getPriceLabel(room)}
                      </td>
                      <td className={`p-1 text-center border-r border-slate-300 font-bold ${room.status === 'R' ? 'bg-emerald-600 text-white' : ''}`}>
                        {room.status === 'R' ? '✓' : ''}
                      </td>
                      <td className={`p-1 text-center border-r border-slate-300 font-bold ${room.status === 'V' ? 'bg-blue-600 text-white' : ''}`}>
                        {room.status === 'V' ? '✓' : ''}
                      </td>
                      <td className={`p-1 text-center font-bold ${room.status === 'O' ? 'bg-rose-600 text-white' : ''}`}>
                        {room.status === 'O' ? '✓' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BLOQUE SUPERIOR DERECHO: SEGUNDO PISO */}
            <div className="border border-slate-700 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-700 text-slate-800 font-bold text-center">
                    <th className="p-1 w-8 border-r border-slate-400">Nº</th>
                    <th className="p-1 w-24 border-r border-slate-400">Tipo</th>
                    <th className="p-1 w-16 border-r border-slate-400">Tarifa</th>
                    <th className="p-1 w-7 border-r border-slate-400 bg-emerald-50 text-emerald-900">R</th>
                    <th className="p-1 w-7 border-r border-slate-400 bg-blue-50 text-blue-900">V</th>
                    <th className="p-1 w-7 bg-rose-50 text-rose-900">O</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {segundoPisoRooms.map(room => (
                    <tr
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className="hover:bg-blue-50 cursor-pointer font-medium"
                    >
                      <td className="p-1 text-center font-bold font-mono-numbers border-r border-slate-300">
                        {room.number}
                      </td>
                      <td className={`p-1 border-r border-slate-300 font-semibold ${
                        room.type === 'Premium' ? 'bg-emerald-100' :
                        room.type === 'Doble' ? 'bg-cyan-100' :
                        room.type === 'Mini Suite' ? 'bg-violet-50' : ''
                      }`}>
                        {room.type}
                      </td>
                      <td className="p-1 text-center font-mono-numbers border-r border-slate-300 font-bold">
                        {getPriceLabel(room)}
                      </td>
                      <td className={`p-1 text-center border-r border-slate-300 font-bold ${room.status === 'R' ? 'bg-emerald-600 text-white' : ''}`}>
                        {room.status === 'R' ? '✓' : ''}
                      </td>
                      <td className={`p-1 text-center border-r border-slate-300 font-bold ${room.status === 'V' ? 'bg-blue-600 text-white' : ''}`}>
                        {room.status === 'V' ? '✓' : ''}
                      </td>
                      <td className={`p-1 text-center font-bold ${room.status === 'O' ? 'bg-rose-600 text-white' : ''}`}>
                        {room.status === 'O' ? '✓' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BLOQUE INFERIOR IZQUIERDO: PRIMER PISO */}
            <div className="border border-slate-700 rounded overflow-hidden">
              <div className="bg-blue-900 text-white text-center font-bold py-1 text-xs tracking-wider">
                PRIMER PISO
              </div>
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-700 text-slate-800 font-bold text-center">
                    <th className="p-1 w-8 border-r border-slate-400">Nº</th>
                    <th className="p-1 w-24 border-r border-slate-400">Tipo</th>
                    <th className="p-1 w-16 border-r border-slate-400">Tarifa</th>
                    <th className="p-1 w-7 border-r border-slate-400 bg-emerald-50 text-emerald-900">R</th>
                    <th className="p-1 w-7 border-r border-slate-400 bg-blue-50 text-blue-900">V</th>
                    <th className="p-1 w-7 bg-rose-50 text-rose-900">O</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {primerPisoRooms.map(room => (
                    <tr
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className="hover:bg-blue-50 cursor-pointer font-medium"
                    >
                      <td className="p-1 text-center font-bold font-mono-numbers border-r border-slate-300">
                        {room.number}
                      </td>
                      <td className={`p-1 border-r border-slate-300 font-semibold ${
                        room.type === 'Ejecutiva' ? 'bg-amber-100' :
                        room.type === 'Doble' ? 'bg-cyan-100' :
                        room.type === 'Premium' ? 'bg-emerald-100' :
                        room.type === 'Mini Suite' ? 'bg-violet-50' :
                        room.type === 'Sencilla' ? 'bg-slate-50' : ''
                      }`}>
                        {room.type}
                      </td>
                      <td className="p-1 text-center font-mono-numbers border-r border-slate-300 font-bold">
                        {getPriceLabel(room)}
                      </td>
                      <td className={`p-1 text-center border-r border-slate-300 font-bold ${room.status === 'R' ? 'bg-emerald-600 text-white' : ''}`}>
                        {room.status === 'R' ? '✓' : ''}
                      </td>
                      <td className={`p-1 text-center border-r border-slate-300 font-bold ${room.status === 'V' ? 'bg-blue-600 text-white' : ''}`}>
                        {room.status === 'V' ? '✓' : ''}
                      </td>
                      <td className={`p-1 text-center font-bold ${room.status === 'O' ? 'bg-rose-600 text-white' : ''}`}>
                        {room.status === 'O' ? '✓' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BLOQUE INFERIOR DERECHO: GARAJES Y RESUMEN */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="border border-slate-700 rounded overflow-hidden">
                <div className="bg-slate-800 text-white text-center font-bold py-1 text-xs tracking-wider">
                  GARAJES
                </div>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-700 text-slate-800 font-bold text-center">
                      <th className="p-1 w-8 border-r border-slate-400">Nº</th>
                      <th className="p-1 w-24 border-r border-slate-400">Tipo</th>
                      <th className="p-1 w-16 border-r border-slate-400">Tarifa</th>
                      <th className="p-1 w-7 border-r border-slate-400 bg-emerald-50 text-emerald-900">R</th>
                      <th className="p-1 w-7 border-r border-slate-400 bg-blue-50 text-blue-900">V</th>
                      <th className="p-1 w-7 bg-rose-50 text-rose-900">O</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {garajesRooms.map(room => (
                      <tr
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className="hover:bg-blue-50 cursor-pointer font-medium"
                      >
                        <td className="p-1 text-center font-bold font-mono-numbers border-r border-slate-300">
                          {room.number}
                        </td>
                        <td className={`p-1 border-r border-slate-300 font-semibold ${
                          room.type === 'Ejecutiva' ? 'bg-amber-100' :
                          room.type === 'Doble' ? 'bg-cyan-100' :
                          room.type === 'Sencilla' ? 'bg-slate-50' : ''
                        }`}>
                          {room.type}
                        </td>
                        <td className="p-1 text-center font-mono-numbers border-r border-slate-300 font-bold">
                          {getPriceLabel(room)}
                        </td>
                        <td className={`p-1 text-center border-r border-slate-300 font-bold ${room.status === 'R' ? 'bg-emerald-600 text-white' : ''}`}>
                          {room.status === 'R' ? '✓' : ''}
                        </td>
                        <td className={`p-1 text-center border-r border-slate-300 font-bold ${room.status === 'V' ? 'bg-blue-600 text-white' : ''}`}>
                          {room.status === 'V' ? '✓' : ''}
                        </td>
                        <td className={`p-1 text-center font-bold ${room.status === 'O' ? 'bg-rose-600 text-white' : ''}`}>
                          {room.status === 'O' ? '✓' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Exact summary lines from the bottom of the photo */}
              <div className="bg-slate-50 border-2 border-slate-800 p-4 rounded-lg space-y-3 font-bold">
                <div className="flex items-center justify-between text-sm">
                  <span className="uppercase tracking-wide">HABITACIONES OCUPADAS:</span>
                  <span className="font-mono-numbers text-rose-700 text-lg underline decoration-2 underline-offset-4">
                    {occupiedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="uppercase tracking-wide">HABITACIONES DISPONIBLES:</span>
                  <span className="font-mono-numbers text-blue-700 text-lg underline decoration-2 underline-offset-4">
                    {availableCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-300">
                  <span>HABITACIONES RESERVADAS:</span>
                  <span className="font-mono-numbers text-emerald-700">{reservedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
