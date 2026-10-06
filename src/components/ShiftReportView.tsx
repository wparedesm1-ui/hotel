import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import {
  Printer,
  FileSpreadsheet,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const ShiftReportView: React.FC = () => {
  const {
    activeShift,
    shifts,
    getShiftSummary,
    switchShift,
    closeCurrentShift,
    findReceptionistByCedula,
    saveReceptionist,
    exportDailySalesToExcel
  } = useHotel();

  const [selectedShiftId, setSelectedShiftId] = useState<string>(activeShift.id);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closingNotes, setClosingNotes] = useState('');

  // Relevo & Cédula
  const [nextCedula, setNextCedula] = useState('0923456789');
  const [nextReceptionist, setNextReceptionist] = useState('Elena Torres');
  const [cedulaLookupMsg, setCedulaLookupMsg] = useState('');

  // Siguiente Turno: Solo dos opciones
  const [nextShiftName, setNextShiftName] = useState<'Turno Día (08:00 a 18:00)' | 'Turno Noche (18:00 a 08:00)'>(
    activeShift.name.includes('Día') ? 'Turno Noche (18:00 a 08:00)' : 'Turno Día (08:00 a 18:00)'
  );

  const summary = getShiftSummary(selectedShiftId);

  // Valores de Arqueo: Valor a dejar en caja y Valor a guardar a parte
  const totalEfectivoEnGaveta = Math.max(0, summary.netCashInDrawer);
  const [cashToLeaveInDrawer, setCashToLeaveInDrawer] = useState<string>(
    (Math.min(100, totalEfectivoEnGaveta)).toFixed(2)
  );
  const [cashToSaveVault, setCashToSaveVault] = useState<string>(
    (Math.max(0, totalEfectivoEnGaveta - Math.min(100, totalEfectivoEnGaveta))).toFixed(2)
  );

  // When modal opens, sync values
  const handleOpenCloseModal = () => {
    const total = Math.max(0, summary.netCashInDrawer);
    const suggestedLeave = Math.min(100, total);
    const suggestedVault = Math.max(0, total - suggestedLeave);
    setCashToLeaveInDrawer(suggestedLeave.toFixed(2));
    setCashToSaveVault(suggestedVault.toFixed(2));
    setNextShiftName(activeShift.name.includes('Día') ? 'Turno Noche (18:00 a 08:00)' : 'Turno Día (08:00 a 18:00)');
    setIsCloseModalOpen(true);
  };

  // Cédula Lookup on Enter
  const handleLookupCedula = (ced: string) => {
    if (!ced.trim()) return;
    const found = findReceptionistByCedula(ced);
    if (found) {
      setNextReceptionist(found.name);
      setCedulaLookupMsg(`✅ ${found.name} identificado`);
    } else {
      setCedulaLookupMsg(`ℹ️ Cédula nueva detectada. Escriba el nombre para registrarla.`);
    }
  };

  const handleCedulaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookupCedula(nextCedula);
    }
  };

  const handleLeaveChange = (valStr: string) => {
    setCashToLeaveInDrawer(valStr);
    const leaveNum = parseFloat(valStr) || 0;
    const remaining = Math.max(0, totalEfectivoEnGaveta - leaveNum);
    setCashToSaveVault(remaining.toFixed(2));
  };

  const handleVaultChange = (valStr: string) => {
    setCashToSaveVault(valStr);
    const vaultNum = parseFloat(valStr) || 0;
    const remaining = Math.max(0, totalEfectivoEnGaveta - vaultNum);
    setCashToLeaveInDrawer(remaining.toFixed(2));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExecuteShiftClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextReceptionist.trim()) {
      alert('Ingrese el nombre del recepcionista entrante');
      return;
    }

    const leave = parseFloat(cashToLeaveInDrawer) || 0;
    const vault = parseFloat(cashToSaveVault) || 0;

    // Save next receptionist to directory if new
    saveReceptionist({
      cedula: nextCedula.trim(),
      name: nextReceptionist.trim()
    });

    // Close current shift recording cash retained vs vault
    closeCurrentShift({
      notes: closingNotes,
      cashRetainedInDrawer: leave,
      cashHandedOverOrVault: vault
    });

    // Switch to next shift starting with the money left in drawer
    switchShift({
      receptionistName: nextReceptionist.trim(),
      receptionistCedula: nextCedula.trim(),
      shiftName: nextShiftName,
      initialCash: leave,
      cashRetainedInDrawer: leave,
      cashHandedOverOrVault: 0,
      notes: `Relevo recibido con base de caja de $${leave.toFixed(2)}. Valor guardado/entregado a parte por turno anterior: $${vault.toFixed(2)}.`
    });

    setIsCloseModalOpen(false);
    alert(`¡Cierre de turno completado!\n\n• Se guardó a parte (administración/sobre): $${vault.toFixed(2)}\n• Se deja en caja para nuevo turno: $${leave.toFixed(2)}\n• Nuevo turno iniciado a cargo de: ${nextReceptionist}`);
  };

  return (
    <div className="space-y-6">
      {/* Action Header (Hidden in Print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Reporte de Cierre y Liquidación por Turno
          </h2>
          <p className="text-xs text-slate-500">
            Arqueo de caja, habitaciones vendidas, recaudación en efectivo vs transferencias y liquidación de efectivo a guardar vs dinero que deja en caja.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Shift Selector */}
          <select
            value={selectedShiftId}
            onChange={e => setSelectedShiftId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
          >
            {shifts.map(s => (
              <option key={s.id} value={s.id}>
                {s.date} - {s.name} ({s.receptionistName})
              </option>
            ))}
          </select>

          {/* BOTÓN CONFIRMADO: GENERAR EXCEL DE LAS VENTAS DEL DÍA */}
          <button
            onClick={() => exportDailySalesToExcel(summary.shift.date)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Descargar archivo Excel (.csv con formato oficial) de las ventas del día"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            Generar Excel de Ventas del Día
          </button>

          <button
            onClick={handleOpenCloseModal}
            className="px-4 py-2 text-xs font-bold text-slate-900 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Cerrar Turno y Relevo
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir Reporte
          </button>
        </div>
      </div>

      {/* PRINTABLE SHIFT REPORT FORM */}
      <div className="bg-white border-2 border-slate-800 rounded-xl p-6 lg:p-8 shadow-sm space-y-6 text-slate-900">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xl">
              H
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                HOTEL - Tu descanso, nuestra prioridad
              </h1>
              <p className="text-xs font-bold text-blue-900 uppercase">
                REPORTE OFICIAL DE LIQUIDACIÓN DE TURNO Y ARQUEO DE CAJA
              </p>
            </div>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <p className="font-mono-numbers">
              <span className="font-bold text-slate-700">FECHA:</span> {summary.shift.date}
            </p>
            <p>
              <span className="font-bold text-slate-700">TURNO:</span> {summary.shift.name}
            </p>
            <p>
              <span className="font-bold text-slate-700">RECEPCIONISTA:</span>{' '}
              <strong className="text-blue-950">{summary.shift.receptionistName}</strong>
              {summary.shift.receptionistCedula && (
                <span className="text-slate-500 text-[11px]"> (C.I: {summary.shift.receptionistCedula})</span>
              )}
            </p>
            <p className="text-[11px] text-slate-500">
              Turno Anterior: {summary.shift.previousShiftReceptionist || 'Elena Torres'}
            </p>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Habitaciones Vendidas */}
          <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50">
            <span className="font-bold text-slate-600 block">Habitaciones Vendidas</span>
            <span className="text-2xl font-bold font-mono-numbers text-slate-900">
              {summary.roomsSold}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Total hospedajes: ${summary.roomSalesTotal.toFixed(2)}
            </span>
          </div>

          {/* Recaudado en Efectivo */}
          <div className="p-3.5 rounded-lg border border-emerald-300 bg-emerald-50/40">
            <span className="font-bold text-emerald-800 block">Total Efectivo Cobrado</span>
            <span className="text-2xl font-bold font-mono-numbers text-emerald-700">
              ${summary.totalCashIncome.toFixed(2)}
            </span>
            <span className="text-[11px] text-emerald-600 block mt-1">
              Hab: ${summary.roomSalesCash.toFixed(2)} · Snacks: ${summary.snackSalesCash.toFixed(2)}
            </span>
          </div>

          {/* Recaudado en Transferencia */}
          <div className="p-3.5 rounded-lg border border-blue-300 bg-blue-50/40">
            <span className="font-bold text-blue-800 block">Total Transferencias</span>
            <span className="text-2xl font-bold font-mono-numbers text-blue-700">
              ${summary.totalTransferIncome.toFixed(2)}
            </span>
            <span className="text-[11px] text-blue-600 block mt-1">
              Hab: ${summary.roomSalesTransfer.toFixed(2)} · Snacks: ${summary.snackSalesTransfer.toFixed(2)}
            </span>
          </div>

          {/* Gastos en el Turno */}
          <div className="p-3.5 rounded-lg border border-rose-300 bg-rose-50/40">
            <span className="font-bold text-rose-800 block">Gastos Registrados</span>
            <span className="text-2xl font-bold font-mono-numbers text-rose-700">
              -${summary.expensesTotal.toFixed(2)}
            </span>
            <span className="text-[11px] text-rose-600 block mt-1">
              Efectivo: -${summary.expensesCash.toFixed(2)} · Transf: -${summary.expensesTransfer.toFixed(2)}
            </span>
          </div>
        </div>

        {/* DETALLE 1: HABITACIONES VENDIDAS EN EL TURNO (SOLO EFECTIVO O TRANSFERENCIA) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              1. Habitaciones Vendidas / Ocupadas en el Turno ({summary.bookingsList.length})
            </h3>
            <span className="text-xs font-mono-numbers font-bold text-slate-700">
              Subtotal Hospedaje: ${summary.roomSalesTotal.toFixed(2)}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-300 text-[11px]">
                  <th className="p-2 w-16">Nº Hab.</th>
                  <th className="p-2">Nombre del Huésped</th>
                  <th className="p-2 text-center">Noches</th>
                  <th className="p-2 text-center">Forma Pago (E / TR)</th>
                  <th className="p-2">Recibo / Factura</th>
                  <th className="p-2 text-right">Efectivo ($)</th>
                  <th className="p-2 text-right">Transferencia ($)</th>
                  <th className="p-2 text-right">Total ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {summary.bookingsList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-3 text-center text-slate-400 italic">
                      No se registraron ventas de habitaciones en este turno.
                    </td>
                  </tr>
                ) : (
                  summary.bookingsList.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono-numbers font-bold text-blue-900">
                        {b.roomNumber}
                      </td>
                      <td className="p-2 font-medium">{b.guestName}</td>
                      <td className="p-2 text-center font-mono-numbers">{b.nights}</td>
                      <td className="p-2 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.paymentMethod === 'E'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}>
                          {b.paymentMethod === 'E' ? 'Efectivo' : 'Transferencia'}
                        </span>
                      </td>
                      <td className="p-2 font-mono-numbers text-slate-600 text-[11px]">{b.invoiceOrReceipt || '—'}</td>
                      <td className="p-2 text-right font-mono-numbers font-semibold text-slate-900">
                        {b.paymentMethod === 'E' ? `$${(b.paidAmount || b.roomTotal).toFixed(2)}` : '—'}
                      </td>
                      <td className="p-2 text-right font-mono-numbers font-semibold text-slate-900">
                        {b.paymentMethod === 'TR' ? `$${(b.paidAmount || b.roomTotal).toFixed(2)}` : '—'}
                      </td>
                      <td className="p-2 text-right font-mono-numbers font-bold text-slate-900">
                        ${(b.paidAmount || b.roomTotal).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETALLE 2: CONSUMOS DE BEBIDAS Y SNACKS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              2. Consumos de Bebidas y Snacks del Turno ({summary.consumptionsList.length})
            </h3>
            <span className="text-xs font-mono-numbers font-bold text-slate-700">
              Subtotal Kiosco: ${summary.snackSalesTotal.toFixed(2)}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-300 text-[11px]">
                  <th className="p-2">Habitación / Origen</th>
                  <th className="p-2">Producto</th>
                  <th className="p-2 text-center">Cant.</th>
                  <th className="p-2 text-center">Forma Pago</th>
                  <th className="p-2 text-right">Efectivo ($)</th>
                  <th className="p-2 text-right">Transferencia ($)</th>
                  <th className="p-2 text-right">Total ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {summary.consumptionsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-3 text-center text-slate-400 italic">
                      No se registraron ventas de snacks o bebidas en este turno.
                    </td>
                  </tr>
                ) : (
                  summary.consumptionsList.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-2 font-medium">
                        {c.roomNumber ? `Hab. ${c.roomNumber}` : 'Venta de Mostrador'}
                      </td>
                      <td className="p-2 font-semibold text-slate-800">{c.productName}</td>
                      <td className="p-2 text-center font-mono-numbers">{c.quantity}</td>
                      <td className="p-2 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.paymentMethod === 'E' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {c.paymentMethod === 'E' ? 'Efectivo' : 'Transferencia'}
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono-numbers">
                        {c.paymentMethod === 'E' ? `$${c.total.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-2 text-right font-mono-numbers">
                        {c.paymentMethod === 'TR' ? `$${c.total.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-2 text-right font-mono-numbers font-bold">
                        ${c.total.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETALLE 3: SALIDAS DE DINERO Y GASTOS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              3. Salidas de Dinero / Gastos del Hotel en el Turno ({summary.expensesList.length})
            </h3>
            <span className="text-xs font-mono-numbers font-bold text-rose-700">
              Total Gastado: -${summary.expensesTotal.toFixed(2)}
            </span>
          </div>

          <div className="overflow-x-auto border border-rose-200 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-rose-50/50 font-bold border-b border-rose-200 text-[11px] text-rose-900">
                  <th className="p-2">Hora</th>
                  <th className="p-2">¿En qué se utilizó el dinero? (Concepto)</th>
                  <th className="p-2">Categoría</th>
                  <th className="p-2 text-center">Método Salida</th>
                  <th className="p-2 text-right">Monto Gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100">
                {summary.expensesList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-slate-400 italic">
                      No se registraron salidas de dinero en este turno.
                    </td>
                  </tr>
                ) : (
                  summary.expensesList.map(e => (
                    <tr key={e.id} className="hover:bg-rose-50/30">
                      <td className="p-2 font-mono-numbers text-slate-500">{e.createdAt.slice(11, 16)}</td>
                      <td className="p-2 font-semibold text-slate-900">{e.concept}</td>
                      <td className="p-2 text-slate-600">{e.category}</td>
                      <td className="p-2 text-center font-bold">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          e.paymentMethod === 'E' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {e.paymentMethod === 'E' ? 'Efectivo de Caja' : 'Transferencia Banco'}
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono-numbers font-bold text-rose-700">
                        -${e.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LIQUIDACIÓN FINAL Y CUADRE DE CAJA: INDICANDO VALOR A GUARDAR A PARTE DEL QUE SE DEJA EN CAJA */}
        <div className="border-2 border-slate-900 rounded-xl p-5 bg-slate-50/80 space-y-4">
          <h3 className="text-sm font-black uppercase text-slate-950 border-b border-slate-300 pb-2">
            Liquidación Final y Cuadre de Caja
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Columna 1: Efectivo Físico en Caja & Desglose de Entrega */}
            <div className="space-y-2 border-r md:border-r border-slate-300 pr-0 md:pr-4">
              <span className="font-bold text-slate-900 uppercase block mb-1">
                A. Arqueo de Efectivo Físico (Gaveta)
              </span>

              <div className="flex justify-between text-slate-600">
                <span>(+) Base Inicial de Caja en Efectivo:</span>
                <span className="font-mono-numbers font-semibold">${summary.initialCash.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-emerald-800">
                <span>(+) Cobros en Efectivo (Habitaciones):</span>
                <span className="font-mono-numbers font-semibold">+${summary.roomSalesCash.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-emerald-800">
                <span>(+) Cobros en Efectivo (Snacks/Bebidas):</span>
                <span className="font-mono-numbers font-semibold">+${summary.snackSalesCash.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-rose-700">
                <span>(-) Gastos Pagados en Efectivo de Caja:</span>
                <span className="font-mono-numbers font-semibold">-${summary.expensesCash.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-400 font-bold text-slate-900">
                <span>(=) TOTAL EFECTIVO FÍSICO ARQUEADO:</span>
                <span className="font-mono-numbers text-base text-slate-950 font-black">
                  ${summary.netCashInDrawer.toFixed(2)}
                </span>
              </div>

              {/* DESGLOSE ESPECÍFICO REQUERIDO: VALOR QUE SE DEJA EN CAJA Y VALOR A GUARDAR A PARTE */}
              <div className="mt-3 p-3 bg-white rounded-lg border-2 border-blue-900 space-y-1.5 shadow-2xs">
                <p className="font-black text-blue-950 uppercase text-[11px] border-b border-blue-200 pb-1">
                  Distribución de Entrega de Efectivo (Relevo):
                </p>
                <div className="flex justify-between items-center text-slate-800 font-semibold">
                  <span>1. VALOR QUE SE DEJA EN CAJA (Base Siguiente Turno):</span>
                  <span className="font-mono-numbers font-bold text-blue-700 text-sm">
                    ${(summary.cashRetainedInDrawer ?? Math.min(100, summary.netCashInDrawer)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-800 font-semibold">
                  <span>2. VALOR A GUARDAR A PARTE (Sobre / Administración):</span>
                  <span className="font-mono-numbers font-bold text-emerald-700 text-sm">
                    ${(summary.cashHandedOverOrVault ?? Math.max(0, summary.netCashInDrawer - (summary.cashRetainedInDrawer ?? Math.min(100, summary.netCashInDrawer)))).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Columna 2: Banco y Balance Total */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 uppercase block mb-1">
                B. Transferencias Bancarias y Totales del Turno
              </span>

              <div className="flex justify-between text-blue-800">
                <span>(+) Transferencias Cobradas (Habitaciones):</span>
                <span className="font-mono-numbers font-semibold">${summary.roomSalesTransfer.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-blue-800">
                <span>(+) Transferencias Cobradas (Snacks):</span>
                <span className="font-mono-numbers font-semibold">+${summary.snackSalesTransfer.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>(-) Gastos Pagados por Transferencia:</span>
                <span className="font-mono-numbers font-semibold">-${summary.expensesTransfer.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-950">
                <span>(=) GRAN TOTAL INGRESOS NETOS (TURNO):</span>
                <span className="font-mono-numbers text-base text-emerald-700 font-black">
                  ${summary.totalBalanceNet.toFixed(2)}
                </span>
              </div>

              {summary.shift.notes && (
                <div className="mt-4 p-2.5 bg-yellow-50 rounded border border-yellow-200 text-[11px] text-yellow-950">
                  <span className="font-bold block">Observaciones del Relevo:</span>
                  <p>{summary.shift.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Firmas de Entrega y Recepción */}
        <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-slate-900 w-3/4 mx-auto mb-2 pb-1">
              <span className="font-serif italic text-slate-700 block">
                {summary.shift.receptionistName}
              </span>
            </div>
            <p className="font-bold uppercase tracking-wider text-slate-800">
              Recepcionista Saliente (Entrega)
            </p>
            <p className="text-[11px] text-slate-500">
              Cédula: {summary.shift.receptionistCedula || '_______________'}
            </p>
          </div>

          <div>
            <div className="border-b border-slate-900 w-3/4 mx-auto mb-2 pb-1">
              <span className="font-serif italic text-slate-400 block">
                ___________________________
              </span>
            </div>
            <p className="font-bold uppercase tracking-wider text-slate-800">
              Recepcionista Entrante / Administrador (Recibe)
            </p>
            <p className="text-[11px] text-slate-500">
              Firma y conformidad de fondo en caja y dinero a guardar
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Cerrar Turno e Iniciar Nuevo */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Cierre de Turno y Relevo
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Arqueo de caja: Total efectivo recaudado en gaveta <strong className="text-blue-900 font-mono-numbers font-black">${totalEfectivoEnGaveta.toFixed(2)}</strong>.
            </p>

            <form onSubmit={handleExecuteShiftClose} className="space-y-4">
              {/* SECCIÓN CRÍTICA: INDICAR VALOR A GUARDAR A PARTE DEL QUE SE DEJA EN CAJA */}
              <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 uppercase text-[11px]">
                    💵 Arqueo y Liquidación de Efectivo
                  </span>
                  <span className="font-mono-numbers font-black text-blue-900">
                    Total en Gaveta: ${totalEfectivoEnGaveta.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      1. Valor que DEJA EN CAJA ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={cashToLeaveInDrawer}
                      onChange={e => handleLeaveChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-blue-300 focus:border-blue-600 rounded-lg font-mono-numbers font-bold text-blue-950 bg-white"
                      placeholder="100.00"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Fondo / cambio que se queda físicamente en la gaveta.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      2. Valor A GUARDAR A PARTE ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={cashToSaveVault}
                      onChange={e => handleVaultChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-emerald-300 focus:border-emerald-600 rounded-lg font-mono-numbers font-bold text-emerald-900 bg-white"
                      placeholder="150.00"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Dinero retirado en sobre / caja fuerte / administración.
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200 flex justify-between items-center text-[11px]">
                  <span className="text-slate-600 font-medium">Suma comprobada:</span>
                  <span className="font-mono-numbers font-bold text-slate-800">
                    ${(parseFloat(cashToLeaveInDrawer) || 0) + (parseFloat(cashToSaveVault) || 0)} = ${totalEfectivoEnGaveta.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* SECCIÓN: RECEPCIONISTA ENTRANTE CON CÉDULA Y ENTER */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Cédula del Recepcionista Entrante * <span className="text-blue-700 text-[11px] font-normal">(Presione ENTER)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ej: 0923456789 (Presione Enter)"
                      value={nextCedula}
                      onChange={e => {
                        setNextCedula(e.target.value);
                        setCedulaLookupMsg('');
                      }}
                      onKeyDown={handleCedulaKeyDown}
                      className="w-full pl-3 pr-10 py-2 text-sm border-2 border-slate-300 focus:border-blue-600 rounded-lg font-mono-numbers font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => handleLookupCedula(nextCedula)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-600 hover:text-blue-800"
                      title="Buscar Recepcionista"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  {cedulaLookupMsg && (
                    <p className="text-[11px] font-semibold text-blue-800 mt-1">{cedulaLookupMsg}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Recepcionista Entrante *
                  </label>
                  <input
                    type="text"
                    required
                    value={nextReceptionist}
                    onChange={e => setNextReceptionist(e.target.value)}
                    placeholder="Ej: Elena Torres"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              {/* SECCIÓN: TURNO SOLO DOS OPCIONES: DÍA O NOCHE */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Siguiente Turno * (2 Opciones Oficiales)
                </label>
                <select
                  value={nextShiftName}
                  onChange={e => setNextShiftName(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border-2 border-slate-300 rounded-lg bg-white font-bold text-blue-950"
                >
                  <option value="Turno Día (08:00 a 18:00)">☀️ Turno Día (08:00 a 18:00)</option>
                  <option value="Turno Noche (18:00 a 08:00)">🌙 Turno Noche (18:00 a 08:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas de Entrega / Novedades del Relevo
                </label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={e => setClosingNotes(e.target.value)}
                  placeholder="Ej: Se deja $XX en gaveta y se guardó $YY en sobre. Novedad en hab 12..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Confirmar Cierre y Relevo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
