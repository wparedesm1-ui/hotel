import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Product, PaymentMethod } from '../types/hotel';
import {
  Coffee,
  Plus,
  Search,
  ShoppingCart,
  Bed,
  Check,
  Package,
  Trash2,
  Edit2,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export const SnackKioskView: React.FC = () => {
  const {
    products,
    rooms,
    bookings,
    getRoomBooking,
    addConsumption,
    addProduct,
    updateProduct,
    deleteProduct,
    activeShift
  } = useHotel();

  const [activeTab, setActiveTab] = useState<'habitacion' | 'mostrador' | 'historial' | 'catalogo'>('habitacion');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  // Room charge form state
  const occupiedRooms = rooms.filter(r => r.status === 'O');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>(occupiedRooms[0]?.number || '');
  const [selectedProdId, setSelectedProdId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [chargeToTab, setChargeToTab] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('E');

  // New Product Modal / Form
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('Bebidas');
  const [newProdPrice, setNewProdPrice] = useState('1.50');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdUnit, setNewProdUnit] = useState('unidad');

  // Filtered Products
  const filteredProducts = products.filter(p => {
    if (categoryFilter !== 'todos' && p.category !== categoryFilter) return false;
    if (searchTerm.trim() !== '') {
      return p.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // Calculate Shift Snack Stats
  let totalSnackRevenue = 0;
  let totalSnackCash = 0;
  let totalSnackTransfer = 0;
  let totalSnackCount = 0;

  bookings.forEach(b => {
    b.consumptions.forEach(c => {
      if (c.shiftId === activeShift.id) {
        totalSnackRevenue += c.total;
        totalSnackCount += c.quantity;
        if (c.paymentMethod === 'E') totalSnackCash += c.total;
        else if (c.paymentMethod === 'TR') totalSnackTransfer += c.total;
      }
    });
  });

  const handleChargeToRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProdId);
    if (!product || !selectedRoomNumber) return;

    const booking = getRoomBooking(selectedRoomNumber);
    if (!booking) {
      alert('La habitación seleccionada no tiene una reserva activa');
      return;
    }

    addConsumption({
      roomNumber: selectedRoomNumber,
      bookingId: booking.id,
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: Number(quantity),
      paymentMethod: chargeToTab ? booking.paymentMethod : paymentMethod,
      isPaid: !chargeToTab
    });

    alert(`¡Consumo de ${quantity}x ${product.name} registrado con éxito a la habitación ${selectedRoomNumber}!`);
    setQuantity(1);
  };

  const handleDirectCounterSale = (product: Product) => {
    const qty = prompt(`¿Cuántas unidades de "${product.name}" desea vender?`, '1');
    if (!qty) return;
    const numQty = parseInt(qty, 10);
    if (isNaN(numQty) || numQty <= 0) return;

    const method = prompt('Forma de pago:\nE = Efectivo\nTR = Transferencia', 'E')?.toUpperCase();
    const validMethod: PaymentMethod = method === 'TR' ? 'TR' : 'E';

    addConsumption({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: numQty,
      paymentMethod: validMethod,
      isPaid: true
    });

    alert(`¡Venta de mostrador registrada por $${(product.price * numQty).toFixed(2)} (${validMethod === 'E' ? 'Efectivo' : 'Transferencia'})!`);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    addProduct({
      name: newProdName.trim(),
      category: newProdCategory,
      price: parseFloat(newProdPrice) || 0,
      stock: parseInt(newProdStock, 10) || 0,
      unit: newProdUnit.trim()
    });

    setNewProdName('');
    setIsNewProductOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Ventas Totales Snacks</p>
          <p className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1">
            ${totalSnackRevenue.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono-numbers">{totalSnackCount} unidades vendidas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-800">Snacks en Efectivo</p>
          <p className="text-2xl font-bold font-mono-numbers text-emerald-700 mt-1">
            ${totalSnackCash.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Caja recepción</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <p className="text-xs font-semibold text-blue-800">Snacks en Transferencia</p>
          <p className="text-2xl font-bold font-mono-numbers text-blue-700 mt-1">
            ${totalSnackTransfer.toFixed(2)}
          </p>
          <span className="text-[11px] text-blue-600 font-medium">Bancos</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Productos en Catálogo</p>
          <p className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1">
            {products.length}
          </p>
          <span className="text-[11px] text-slate-400">Bebidas, snacks y artículos</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('habitacion')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'habitacion'
              ? 'bg-blue-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bed className="w-4 h-4" />
          Cargar a Habitación
        </button>

        <button
          onClick={() => setActiveTab('mostrador')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'mostrador'
              ? 'bg-blue-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Venta Directa de Mostrador
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'historial'
              ? 'bg-blue-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Coffee className="w-4 h-4" />
          Control de Consumos por Cliente
        </button>

        <button
          onClick={() => setActiveTab('catalogo')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'catalogo'
              ? 'bg-blue-700 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          Catálogo e Inventario
        </button>
      </div>

      {/* TAB 1: CARGAR A HABITACIÓN */}
      {activeTab === 'habitacion' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Registrar Consumo
              </h3>
              <p className="text-xs text-slate-500">
                Selecciona la habitación ocupada y el producto a cargar.
              </p>
            </div>

            {occupiedRooms.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-lg text-amber-800 text-xs">
                No hay habitaciones ocupadas en este momento para cargar consumos.
              </div>
            ) : (
              <form onSubmit={handleChargeToRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Habitación Ocupada
                  </label>
                  <select
                    value={selectedRoomNumber}
                    onChange={e => setSelectedRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {occupiedRooms.map(r => {
                      const b = getRoomBooking(r.number);
                      return (
                        <option key={r.id} value={r.number}>
                          Hab. {r.number} - {b?.guestName || 'Ocupada'} (${r.type})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Producto (Bebida / Snack)
                  </label>
                  <select
                    value={selectedProdId}
                    onChange={e => setSelectedProdId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ${p.price.toFixed(2)} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono-numbers"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={chargeToTab}
                      onChange={e => setChargeToTab(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-medium text-slate-800">
                      Cargar a la cuenta del huésped (Paga al check-out)
                    </span>
                  </label>

                  {!chargeToTab && (
                    <div className="mt-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Forma de Cobro Inmediato
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="E">💵 E = Efectivo de Caja</option>
                        <option value="TR">📱 TR = Transferencia Bancaria</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Subtotal Preview */}
                {(() => {
                  const p = products.find(prod => prod.id === selectedProdId);
                  const subtotal = p ? p.price * quantity : 0;
                  return (
                    <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Subtotal a registrar:</span>
                      <span className="text-base font-bold font-mono-numbers text-slate-900">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })()}

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Cargar Consumo a Habitación
                </button>
              </form>
            )}
          </div>

          {/* Quick Product Grid */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Selección Rápida de Productos
                </h3>
                <p className="text-xs text-slate-500">
                  Haz clic en un producto para seleccionarlo de inmediato.
                </p>
              </div>

              <div className="flex gap-1 text-xs">
                {['todos', 'Bebidas', 'Snacks', 'Licores'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md font-medium capitalize ${
                      categoryFilter === cat
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map(p => {
                const isSelected = selectedProdId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProdId(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/30'
                        : 'border-slate-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {p.category}
                      </span>
                      <span className="text-xs font-bold font-mono-numbers text-blue-700">
                        ${p.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                      {p.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Stock: {p.stock}</span>
                      {isSelected && (
                        <span className="text-blue-700 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Seleccionado
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VENTA DIRECTA DE MOSTRADOR */}
      {activeTab === 'mostrador' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Punto de Venta de Mostrador
              </h3>
              <p className="text-xs text-slate-500">
                Venta directa en recepción para clientes o visitas que pagan al instante en Efectivo o Transferencia.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar bebida o snack..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(p => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-slate-200 hover:shadow-xs bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{p.category}</span>
                    <span className="text-sm font-bold font-mono-numbers text-emerald-700">
                      ${p.price.toFixed(2)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{p.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Stock disponible: {p.stock} {p.unit}s</p>
                </div>

                <button
                  onClick={() => handleDirectCounterSale(p)}
                  className="mt-3 w-full py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Vender Ahora
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONTROL DE CONSUMOS POR CLIENTE */}
      {activeTab === 'historial' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Control de Consumos de Clientes por Habitación
            </h3>
            <p className="text-xs text-slate-500">
              Detalle exacto de lo que ha consumido cada huésped durante su estadía.
            </p>
          </div>

          <div className="space-y-4">
            {rooms.filter(r => r.status === 'O').map(room => {
              const booking = getRoomBooking(room.number);
              if (!booking) return null;

              const consumptions = booking.consumptions;
              const totalCharged = consumptions.reduce((sum, c) => sum + c.total, 0);

              return (
                <div key={room.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-blue-700 text-white font-mono-numbers font-bold text-xs">
                        Hab. {room.number}
                      </span>
                      <div>
                        <span className="font-bold text-xs text-slate-900">{booking.guestName}</span>
                        <span className="text-[11px] text-slate-500 block">
                          Entrada: {booking.checkInDate} · Salida prevista: {booking.checkOutDate}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500">Total en Snacks: </span>
                      <span className="text-sm font-bold font-mono-numbers text-slate-900">
                        ${totalCharged.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {consumptions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      Sin consumos registrados para este cliente.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {consumptions.map(c => (
                        <div key={c.id} className="p-3 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">{c.productName}</span>
                            <span className="text-[11px] text-slate-500 block">
                              {c.quantity} un. × ${c.unitPrice.toFixed(2)} · Registrado a las {c.createdAt.slice(11, 16)} por {c.receptionistName}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {c.isPaid ? 'Pagado' : 'Por pagar en Check-out'}
                            </span>
                            <span className="font-bold font-mono-numbers text-slate-900">
                              ${c.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CATÁLOGO E INVENTARIO */}
      {activeTab === 'catalogo' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Inventario de Bebidas y Snacks
              </h3>
              <p className="text-xs text-slate-500">
                Configura productos, precios al público y cantidades en stock.
              </p>
            </div>

            <button
              onClick={() => setIsNewProductOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar Nuevo Producto
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-3">Nombre del Producto</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3 text-right">Precio Venta</th>
                  <th className="p-3 text-center">Stock Actual</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                    <td className="p-3 text-slate-500">{p.category}</td>
                    <td className="p-3 text-right font-bold font-mono-numbers text-slate-900">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono-numbers font-bold text-[11px] ${
                        p.stock < 10 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {p.stock} {p.unit}s
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          const newStock = prompt(`Actualizar stock de "${p.name}":`, p.stock.toString());
                          if (newStock !== null) {
                            const val = parseInt(newStock, 10);
                            if (!isNaN(val)) updateProduct(p.id, { stock: val });
                          }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold mr-3"
                      >
                        Ajustar Stock
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar producto "${p.name}"?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="text-xs text-rose-600 hover:text-rose-800"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nuevo Producto */}
      {isNewProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Nuevo Producto para Venta
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ingresa los datos del snack o bebida para el catálogo.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  placeholder="Ej: Jugo del Valle 400ml"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                <select
                  value={newProdCategory}
                  onChange={e => setNewProdCategory(e.target.value as Product['category'])}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Bebidas">Bebidas</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Licores">Licores</option>
                  <option value="Higiene / Otros">Higiene / Otros</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProdStock}
                    onChange={e => setNewProdStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono-numbers"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewProductOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
