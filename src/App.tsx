import React, { useState } from 'react';
import { HotelProvider, useHotel } from './context/HotelContext';
import { Navbar } from './components/Navbar';
import { RoomGrid } from './components/RoomGrid';
import { ReceptionSheetView } from './components/ReceptionSheetView';
import { SnackKioskView } from './components/SnackKioskView';
import { ExpensesManagerView } from './components/ExpensesManagerView';
import { ReservationsView } from './components/ReservationsView';
import { ShiftReportView } from './components/ShiftReportView';
import { RoomDetailModal } from './components/RoomDetailModal';
import { NewReservationModal } from './components/NewReservationModal';
import { PriceTariffModal } from './components/PriceTariffModal';

const HotelAppContent: React.FC = () => {
  const { activeTab } = useHotel();
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isPriceTariffOpen, setIsPriceTariffOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <Navbar
        onOpenNewReservation={() => setIsNewReservationOpen(true)}
        onOpenNewExpense={() => setIsNewExpenseOpen(true)}
        onOpenPriceTariff={() => setIsPriceTariffOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'visual' && <RoomGrid />}
        {activeTab === 'planilla' && <ReceptionSheetView />}
        {activeTab === 'kiosco' && <SnackKioskView />}
        {activeTab === 'caja' && (
          <ExpensesManagerView
            isCreateModalOpen={isNewExpenseOpen}
            onCloseCreateModal={() => setIsNewExpenseOpen(false)}
          />
        )}
        {activeTab === 'reservas' && (
          <ReservationsView
            onOpenNewReservation={() => setIsNewReservationOpen(true)}
          />
        )}
        {activeTab === 'turnos' && <ShiftReportView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} HOTEL - Sistema Integral de Control de Recepción, Caja y Turnos.</p>
          <p className="text-[11px] text-slate-400">
            Control de 44 Habitaciones · Planta Baja, Pisos 1 y 2, Garajes · Tarifas Oficiales 1 y 2 Personas
          </p>
        </div>
      </footer>

      {/* Modals */}
      <RoomDetailModal />
      <NewReservationModal
        isOpen={isNewReservationOpen}
        onClose={() => setIsNewReservationOpen(false)}
      />
      <PriceTariffModal
        isOpen={isPriceTariffOpen}
        onClose={() => setIsPriceTariffOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <HotelProvider>
      <HotelAppContent />
    </HotelProvider>
  );
}
