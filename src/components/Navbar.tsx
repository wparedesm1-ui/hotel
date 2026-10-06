import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import {
  Bed,
  ClipboardList,
  Coffee,
  Wallet,
  CalendarDays,
  UserCheck,
  RotateCcw,
  Plus,
  DollarSign,
  Sparkles,
  FileSpreadsheet,
  Search
} from 'lucide-react';

interface NavbarProps {
  onOpenNewReservation: () => void;
  onOpenNewExpense: () => void;
  onOpenPriceTariff: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewReservation,
  onOpenNewExpense,
  onOpenPriceTariff
}) => {
  const {
    activeTab,
    setActiveTab,
    activeShift,
    switchShift,
    resetAllData,
    resetRoomsCleanAndFree,
    findReceptionistByCedula,
    saveReceptionist,
    exportDailySalesToExcel
  } = useHotel();

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [cedulaInput, setCedulaInput] = useState(activeShift.receptionistCedula || '0912345678');
  const [receptionistInput, setReceptionistInput] = useState(activeShift.receptionistName);
  const [cedulaMsg, setCedulaMsg] = useState('');
  const [shiftNameInput, setShiftNameInput] = useState(activeShift.name || 'Turno Día (08:00 a 18:00)');
  const [initialCashInput, setInitialCashInput] = useState(activeShift.initialCash.toString());

  const handleLookupCedula = (ced: string) => {
    if (!ced.trim()) return;
    const found = findReceptionistByCedula(ced);
    if (found) {
      setReceptionistInput(found.name);
      setCedulaMsg(`✅ ${found.name} identificado`);
    } else {
      setCedulaMsg(`ℹ️ Nueva cédula. Ingrese el nombre para registrarla automáticamente.`);
    }
  };

  const handleCedulaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookupCedula(cedulaInput);
    }
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receptionistInput.trim()) {
      alert('Por favor ingrese el nombre del recepcionista');
      return;
    }

    // Auto save to receptionists catalog if not present
    saveReceptionist({
      cedula: cedulaInput.trim(),
      name: receptionistInput.trim()
    });

    switchShift({
      receptionistName: receptionistInput.trim(),
      receptionistCedula: cedulaInput.trim(),
      shiftName: shiftNameInput,
      initialCash: parseFloat(initialCashInput) || 0
    });
    setIsShiftModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
                <Bed className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                  HOTEL CONTROL
                </span>
                <span className="text-[11px] font-medium text-slate-700 mt-1">
                  Tu descanso, nuestra prioridad
                </span>
              </div>
            </div>

            {/* Zone 2: Navigation Links (Clean text tabs) */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('visual')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'visual'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bed className="w-4 h-4" />
                Habitaciones
              </button>

              <button
                onClick={() => setActiveTab('planilla')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'planilla'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Planilla de Control
              </button>

              <button
                onClick={() => setActiveTab('kiosco')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'kiosco'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Coffee className="w-4 h-4" />
                Bebidas y Snacks
              </button>

              <button
                onClick={() => setActiveTab('caja')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'caja'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wallet className="w-4 h-4" />
                Gastos y Caja
              </button>

              <button
                onClick={() => setActiveTab('reservas')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'reservas'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Reservas
              </button>

              <button
                onClick={() => setActiveTab('turnos')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'turnos'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Reporte de Turno
              </button>
            </nav>

            {/* Zone 3: Receptionist & Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsShiftModalOpen(true)}
                title="Cambiar turno o recepcionista"
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] text-slate-700 uppercase font-semibold leading-tight">Recepcionista</p>
                  <p className="font-semibold text-slate-800 truncate max-w-[110px]">{activeShift.receptionistName}</p>
                </div>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('¿Desea restablecer las 44 habitaciones para que queden TODAS LIBRES Y LIMPIAS listas para realizar ejercicios?')) {
                    resetRoomsCleanAndFree();
                  }
                }}
                title="Dejar todas las habitaciones 100% libres y limpias para ejercicios de prueba"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer border border-teal-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Libres y Limpias
              </button>

              <button
                onClick={onOpenPriceTariff}
                title="Configurar precios de 1 y 2 personas para todas las habitaciones"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Tarifario (1 y 2 Personas)
              </button>

              <button
                onClick={() => exportDailySalesToExcel()}
                title="Generar y descargar archivo Excel (.csv) de las ventas del día"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel Ventas</span>
              </button>

              <button
                onClick={onOpenNewExpense}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar Gasto
              </button>

              <button
                onClick={onOpenNewReservation}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva Reserva
              </button>

              <button
                onClick={() => {
                  if (window.confirm('¿Desea restablecer todos los datos iniciales de prueba del hotel?')) {
                    resetAllData();
                  }
                }}
                title="Restablecer datos originales"
                className="p-2 text-slate-700 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation bar */}
          <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 scrollbar-none">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                activeTab === 'visual' ? 'bg-blue-100 text-blue-800' : 'text-slate-600'
              }`}
            >
              Habitaciones
            </button>
            <button
              onClick={() => setActiveTab('planilla')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                activeTab === 'planilla' ? 'bg-blue-100 text-blue-800' : 'text-slate-600'
              }`}
            >
              Planilla Diaria
            </button>
            <button
              onClick={() => exportDailySalesToExcel()}
              className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-lg whitespace-nowrap flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3 h-3" />
              Excel Ventas
            </button>
            <button
              onClick={() => setActiveTab('kiosco')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                activeTab === 'kiosco' ? 'bg-blue-100 text-blue-800' : 'text-slate-600'
              }`}
            >
              Snacks & Bebidas
            </button>
            <button
              onClick={() => setActiveTab('caja')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                activeTab === 'caja' ? 'bg-blue-100 text-blue-800' : 'text-slate-600'
              }`}
            >
              Gastos & Caja
            </button>
            <button
              onClick={() => setActiveTab('reservas')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                activeTab === 'reservas' ? 'bg-blue-100 text-blue-800' : 'text-slate-600'
              }`}
            >
              Reservas
            </button>
            <button
              onClick={() => setActiveTab('turnos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                activeTab === 'turnos' ? 'bg-blue-100 text-blue-800' : 'text-slate-600'
              }`}
            >
              Reporte Turno
            </button>
          </div>
        </div>
      </header>

      {/* Modal Cambio de Turno / Recepcionista */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Identificación de Recepcionista y Turno
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Coloca el número de cédula y presiona <strong>ENTER</strong> para cargar los datos del recepcionista.
            </p>

            <form onSubmit={handleSaveShift} className="space-y-4">
              {/* Cédula con Enter */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Número de Cédula * <span className="text-[11px] font-normal text-blue-700">(Presione ENTER para buscar)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ej: 0912345678 (Presione Enter)"
                    value={cedulaInput}
                    onChange={e => {
                      setCedulaInput(e.target.value);
                      setCedulaMsg('');
                    }}
                    onKeyDown={handleCedulaKeyDown}
                    className="w-full pl-3 pr-10 py-2 text-sm border-2 border-blue-400 focus:border-blue-600 rounded-lg font-mono-numbers font-bold text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleLookupCedula(cedulaInput)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-600 hover:text-blue-800 font-bold text-xs"
                    title="Buscar por Cédula"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                {cedulaMsg ? (
                  <p className="text-[11px] font-semibold text-blue-800 mt-1">{cedulaMsg}</p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Ejemplos de prueba: <strong>0912345678</strong> (Carlos Mendoza) o <strong>0923456789</strong> (Elena Torres).
                  </p>
                )}
              </div>

              {/* Nombre Recepcionista */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo del Recepcionista *
                </label>
                <input
                  type="text"
                  required
                  value={receptionistInput}
                  onChange={e => setReceptionistInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  placeholder="Ej: Carlos Mendoza"
                />
              </div>

              {/* Turno de Trabajo: Solo 2 opciones */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Turno de Trabajo * (2 Opciones Oficiales)
                </label>
                <select
                  value={shiftNameInput}
                  onChange={e => setShiftNameInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-950 bg-white"
                >
                  <option value="Turno Día (08:00 a 18:00)">☀️ Turno Día (08:00 a 18:00)</option>
                  <option value="Turno Noche (18:00 a 08:00)">🌙 Turno Noche (18:00 a 08:00)</option>
                </select>
              </div>

              {/* Base Inicial de Caja */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base Inicial de Caja en Efectivo ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={initialCashInput}
                  onChange={e => setInitialCashInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-numbers focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100.00"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Dinero físico con el que inicia la gaveta para dar cambio.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
                >
                  Actualizar Recepcionista y Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
