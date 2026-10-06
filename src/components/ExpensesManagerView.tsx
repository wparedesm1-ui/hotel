import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { ExpenseCategory } from '../types/hotel';
import {
  Wallet,
  Plus,
  Trash2,
  DollarSign,
  Receipt,
  Tag,
  ArrowDownRight,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface ExpensesManagerViewProps {
  isCreateModalOpen?: boolean;
  onCloseCreateModal?: () => void;
}

export const ExpensesManagerView: React.FC<ExpensesManagerViewProps> = ({
  isCreateModalOpen: propIsCreateModalOpen,
  onCloseCreateModal
}) => {
  const {
    expenses,
    addExpense,
    deleteExpense,
    activeShift,
    getShiftSummary
  } = useHotel();

  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isModalOpen = propIsCreateModalOpen !== undefined ? propIsCreateModalOpen : internalModalOpen;
  const setModalOpen = (open: boolean) => {
    if (onCloseCreateModal) onCloseCreateModal();
    setInternalModalOpen(open);
  };

  // Form State
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Limpieza y Lavandería');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'E' | 'TR'>('E');
  const [voucherNumber, setVoucherNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Category Filter
  const [filterCategory, setFilterCategory] = useState<string>('todos');

  // Compute Current Financial Balance
  const summary = getShiftSummary(activeShift.id);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || !amount) {
      alert('Por favor ingrese el concepto y el monto');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Ingrese un monto válido');
      return;
    }

    addExpense({
      concept: concept.trim(),
      category,
      amount: numAmount,
      paymentMethod,
      voucherNumber: voucherNumber.trim() || undefined,
      notes: notes.trim() || undefined
    });

    // Reset Form
    setConcept('');
    setAmount('');
    setVoucherNumber('');
    setNotes('');
    setModalOpen(false);
  };

  const filteredExpenses = expenses.filter(exp => {
    if (filterCategory !== 'todos' && exp.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Financial Health & Balances Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ingresos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Total Ingresos Turno</span>
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono-numbers text-slate-900">
            ${summary.totalIncome.toFixed(2)}
          </p>
          <div className="mt-2 text-[11px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-2">
            <div className="flex justify-between">
              <span>Efectivo cobrado:</span>
              <span className="font-semibold text-emerald-700">${summary.totalCashIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transferencias recibidas:</span>
              <span className="font-semibold text-blue-700">${summary.totalTransferIncome.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Total Gastos */}
        <div className="bg-white p-5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-rose-700 mb-1">
            <span className="font-semibold">Total Gastos del Hotel</span>
            <span className="p-1 rounded bg-rose-100 text-rose-700">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono-numbers text-rose-800">
            -${summary.expensesTotal.toFixed(2)}
          </p>
          <div className="mt-2 text-[11px] text-rose-900/80 space-y-0.5 border-t border-rose-200/60 pt-2">
            <div className="flex justify-between">
              <span>Gastos en Efectivo de caja:</span>
              <span className="font-bold text-rose-800">-${summary.expensesCash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gastos pagados por Transf.:</span>
              <span className="font-semibold text-slate-700">-${summary.expensesTransfer.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Efectivo Físico Neto en Caja */}
        <div className="bg-emerald-800 text-white p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-200 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Efectivo Físico en Caja
              </span>
              <Wallet className="w-4 h-4 text-emerald-300" />
            </div>
            <p className="text-3xl font-extrabold font-mono-numbers tracking-tight">
              ${summary.netCashInDrawer.toFixed(2)}
            </p>
            <p className="text-[11px] text-emerald-200 mt-1">
              Dinero real en gaveta para arqueo
            </p>
          </div>

          <div className="text-[10px] text-emerald-100 border-t border-emerald-700/60 pt-2 mt-2 space-y-0.5">
            <div className="flex justify-between">
              <span>Base inicial caja:</span>
              <span className="font-mono-numbers">${summary.initialCash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>(+) Efectivo cobrado:</span>
              <span className="font-mono-numbers">+${summary.totalCashIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-amber-200">
              <span>(-) Gastos en efectivo:</span>
              <span className="font-mono-numbers">-${summary.expensesCash.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Balance Total Neto */}
        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Balance Neto (Ganancia)
              </span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-extrabold font-mono-numbers tracking-tight text-white">
              ${summary.totalBalanceNet.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-300 mt-1">
              Ingresos Totales menos Gastos Totales
            </p>
          </div>

          <div className="text-[10px] text-slate-300 border-t border-slate-800 pt-2 mt-2">
            <span className="text-slate-400">Total en bancos (Transferencias netas): </span>
            <span className="font-bold text-emerald-400 font-mono-numbers">
              ${(summary.totalTransferIncome - summary.expensesTransfer).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Expense Table & Actions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Registro de Salidas de Dinero y Gastos del Hotel
            </h3>
            <p className="text-xs text-slate-500">
              Cada vez que se utiliza dinero de caja o cuenta bancaria, se registra aquí con su concepto exacto.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Registrar Salida de Dinero
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs border-y border-slate-100 py-3">
          <span className="font-bold text-slate-600">Filtrar por Categoría:</span>
          {[
            'todos',
            'Limpieza y Lavandería',
            'Mantenimiento',
            'Servicios Básicos',
            'Compras / Snacks y Bebidas',
            'Alimentos y Desayunos',
            'Imprevisto'
          ].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Expenses List */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3">En qué se utilizó el dinero (Concepto)</th>
                <th className="p-3">Categoría</th>
                <th className="p-3 text-center">Método de Salida</th>
                <th className="p-3 text-right">Monto Gastado</th>
                <th className="p-3">Recepcionista</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                    No hay gastos registrados en esta categoría.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono-numbers text-slate-500 whitespace-nowrap">
                      {exp.createdAt.slice(0, 10)} {exp.createdAt.slice(11, 16)}
                    </td>
                    <td className="p-3 font-semibold text-slate-900 max-w-xs">
                      <div>{exp.concept}</div>
                      {exp.voucherNumber && (
                        <span className="text-[10px] text-slate-400 font-mono-numbers">
                          Comp: {exp.voucherNumber}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          exp.paymentMethod === 'E'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {exp.paymentMethod === 'E' ? 'Efectivo de Caja' : 'Transferencia Banco'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold font-mono-numbers text-rose-600 text-sm">
                      -${exp.amount.toFixed(2)}
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {exp.receptionistName}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar gasto "${exp.concept}" por $${exp.amount.toFixed(2)}?`)) {
                            deleteExpense(exp.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Salida de Dinero */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registrar Salida de Dinero / Gasto
                </h3>
                <p className="text-xs text-slate-500">
                  Especifica en qué se utilizó el dinero para cuadrar la caja.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ¿En qué se utilizó el dinero? (Concepto detallado) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  placeholder="Ej: Compra de 2 bidones de cloro, detergente y fundas para camareras"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monto Gastado ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="15.50"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-numbers focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Método de Salida *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as 'E' | 'TR')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="E">Efectivo de Caja (Resta de gaveta)</option>
                    <option value="TR">Transferencia Hotel (Resta de banco)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría del Gasto
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Limpieza y Lavandería">Limpieza y Lavandería</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Servicios Básicos">Servicios Básicos</option>
                    <option value="Compras / Snacks y Bebidas">Compras / Snacks y Bebidas</option>
                    <option value="Alimentos y Desayunos">Alimentos y Desayunos</option>
                    <option value="Gastos Administrativos">Gastos Administrativos</option>
                    <option value="Imprevisto">Imprevisto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nº Comprobante / Factura
                  </label>
                  <input
                    type="text"
                    value={voucherNumber}
                    onChange={e => setVoucherNumber(e.target.value)}
                    placeholder="Ej: FAC-1092 / REC-44"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas Adicionales (Opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ej: Entregado a la camarera Rosa"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
                >
                  Guardar y Restar de Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
