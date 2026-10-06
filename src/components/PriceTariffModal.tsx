import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Room } from '../types/hotel';
import { X, DollarSign, Save, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

interface PriceTariffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriceTariffModal: React.FC<PriceTariffModalProps> = ({ isOpen, onClose }) => {
  const { rooms, updateRoomPrices, updateRoomFull, addRoom, deleteRoom } = useHotel();

  // Local state for all rooms
  const [localRooms, setLocalRooms] = useState<Room[]>(rooms);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New room inline state
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState('Sencilla');
  const [newRoomFloor, setNewRoomFloor] = useState('PLANTA BAJA');
  const [newPrice1, setNewPrice1] = useState('23.00');
  const [newPrice2, setNewPrice2] = useState('35.00');
  const [newPriceExtra, setNewPriceExtra] = useState('15.00');

  // Keep in sync when modal opens
  React.useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms, isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (roomId: string, field: keyof Room, val: any) => {
    setLocalRooms(prev =>
      prev.map(r => {
        if (r.id !== roomId) return r;
        if (field === 'type') {
          const isSingle = ['Doble', 'Triple', 'Cuádruple'].includes(val);
          const singleP = r.price2Persons || r.price;
          return {
            ...r,
            type: val,
            hasSinglePrice: isSingle,
            price1Person: isSingle ? singleP : r.price1Person,
            price2Persons: singleP,
            price: singleP
          };
        }
        if (r.hasSinglePrice || ['Doble', 'Triple', 'Cuádruple'].includes(r.type)) {
          if (field === 'price1Person' || field === 'price2Persons') {
            const num = parseFloat(val) || 0;
            return {
              ...r,
              price1Person: num,
              price2Persons: num,
              price: num
            };
          }
        }
        return { ...r, [field]: val };
      })
    );
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    localRooms.forEach(room => {
      const isSingle = room.hasSinglePrice || ['Doble', 'Triple', 'Cuádruple'].includes(room.type);
      const singlePrice = Number(room.price2Persons || room.price1Person || room.price);
      updateRoomFull(room.id, {
        number: room.number,
        type: room.type,
        floor: room.floor,
        hasSinglePrice: isSingle,
        price1Person: isSingle ? singlePrice : Number(room.price1Person),
        price2Persons: isSingle ? singlePrice : Number(room.price2Persons),
        priceExtraPerson: Number(room.priceExtraPerson || 15),
        price: isSingle ? singlePrice : Number(room.price2Persons)
      });
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleAddNewRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) {
      alert('Ingresa el número de habitación');
      return;
    }

    const p1 = parseFloat(newPrice1) || 25;
    const p2 = parseFloat(newPrice2) || 35;
    const pe = parseFloat(newPriceExtra) || 10;

    addRoom({
      number: newRoomNumber.trim(),
      type: newRoomType.trim(),
      floor: newRoomFloor,
      price: p2,
      price1Person: p1,
      price2Persons: p2,
      priceExtraPerson: pe,
      status: 'V',
      cleaningStatus: 'L'
    });

    setNewRoomNumber('');
    setIsAddingRoom(false);
  };

  const handleDeleteRoom = (roomId: string, roomNum: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la habitación ${roomNum}?`)) {
      deleteRoom(roomId);
      setLocalRooms(prev => prev.filter(r => r.id !== roomId));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Configurador de Habitaciones y Tarifas (1 y 2 Personas)
            </h3>
            <p className="text-xs text-slate-300">
              Aquí puedes cambiar los números de habitación, tipos, pisos y los precios reales por 1 y 2 personas.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Total de habitaciones registradas: <strong className="text-blue-900 font-mono-numbers">{localRooms.length}</strong>
          </span>

          <button
            type="button"
            onClick={() => setIsAddingRoom(!isAddingRoom)}
            className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAddingRoom ? 'Cerrar Formulario' : 'Agregar Habitación'}
          </button>
        </div>

        {/* Form to Add New Room */}
        {isAddingRoom && (
          <form onSubmit={handleAddNewRoom} className="bg-blue-50/70 p-4 border-b border-blue-200 text-xs animate-in fade-in">
            <h4 className="font-bold text-blue-950 mb-2">
              ➕ Registrar Nueva Habitación en el Hotel:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nº Hab.</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 109"
                  value={newRoomNumber}
                  onChange={e => setNewRoomNumber(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono-numbers font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Piso / Sector</label>
                <select
                  value={newRoomFloor}
                  onChange={e => setNewRoomFloor(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="PLANTA BAJA">PLANTA BAJA</option>
                  <option value="PRIMER PISO">PRIMER PISO</option>
                  <option value="SEGUNDO PISO">SEGUNDO PISO</option>
                  <option value="TERCER PISO">TERCER PISO</option>
                  <option value="GARAJES">GARAJES</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Tipo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Matrimonial"
                  value={newRoomType}
                  onChange={e => setNewRoomType(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Precio 1 Pers ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPrice1}
                  onChange={e => setNewPrice1(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Precio 2 Pers ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPrice2}
                  onChange={e => setNewPrice2(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono-numbers"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs"
                >
                  Guardar Hab.
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Master Table */}
        <form onSubmit={handleSaveAll} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3 w-28">Piso / Sector</th>
                  <th className="p-3 w-24 text-center">Nº Hab.</th>
                  <th className="p-3 w-36">Tipo de Habitación</th>
                  <th className="p-3 text-center w-36">Precio 1 Persona ($)</th>
                  <th className="p-3 text-center w-36">Precio 2 Personas ($)</th>
                  <th className="p-3 text-center w-32">Pers. Adicional ($)</th>
                  <th className="p-3 text-right w-20">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localRooms.map(room => (
                  <tr key={room.id} className="hover:bg-blue-50/40">
                    <td className="p-2">
                      <input
                        type="text"
                        value={room.floor}
                        onChange={e => handleFieldChange(room.id, 'floor', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded font-semibold text-slate-600 bg-white"
                      />
                    </td>

                    <td className="p-2 text-center">
                      <div className="flex flex-col items-center">
                        <input
                          type="text"
                          value={room.number}
                          onChange={e => handleFieldChange(room.id, 'number', e.target.value)}
                          className="w-16 px-2 py-1 text-center text-xs border border-blue-300 rounded font-bold font-mono-numbers text-blue-900 bg-white"
                        />
                        {room.number === '1' && (
                          <span className="text-[9px] font-black text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200 mt-0.5">
                            DESHABILITADA
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-2">
                      <div>
                        <select
                          value={room.type}
                          onChange={e => handleFieldChange(room.id, 'type', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-bold text-slate-800 bg-white cursor-pointer"
                        >
                          <option value="Sencilla">Sencilla</option>
                          <option value="Doble">Doble (Tarifa Única)</option>
                          <option value="Triple">Triple (Tarifa Única)</option>
                          <option value="Cuádruple">Cuádruple (Tarifa Única)</option>
                          <option value="Ejecutiva">Ejecutiva</option>
                          <option value="Premium">Premium</option>
                          <option value="Suite">Suite</option>
                          <option value="Mini Suite">Mini Suite</option>
                        </select>
                        {(room.hasSinglePrice || ['Doble', 'Triple', 'Cuádruple'].includes(room.type)) && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Tarifa Única (1 solo precio)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-2 text-center">
                      <div className="relative inline-block w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={room.price1Person}
                          onChange={e => handleFieldChange(room.id, 'price1Person', parseFloat(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1 text-xs border border-slate-300 rounded font-mono-numbers font-bold text-slate-900 bg-white text-right focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </td>

                    <td className="p-2 text-center">
                      <div className="relative inline-block w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={room.price2Persons}
                          onChange={e => handleFieldChange(room.id, 'price2Persons', parseFloat(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1 text-xs border border-slate-300 rounded font-mono-numbers font-bold text-slate-900 bg-white text-right focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </td>

                    <td className="p-2 text-center">
                      <div className="relative inline-block w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={room.priceExtraPerson || 15}
                          onChange={e => handleFieldChange(room.id, 'priceExtraPerson', parseFloat(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1 text-xs border border-slate-300 rounded font-mono-numbers font-bold text-slate-900 bg-white text-right focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </td>

                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room.id, room.number)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Eliminar esta habitación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Save Area */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                ¡Todas las habitaciones y tarifas se actualizaron y guardaron exitosamente!
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Guarda los cambios para que se reflejen en los botones, en el Check-In y en la Planilla.
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Guardar Todas las Habitaciones y Tarifas
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
