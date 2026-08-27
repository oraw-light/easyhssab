import React, { useState } from 'react';
import { StockItem, StockLedger } from '../types';
import { Package, PlusCircle, AlertTriangle, ListOrdered, DollarSign, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';

interface StockManagerProps {
  stockItems: StockItem[];
  stockLedger: StockLedger[];
  currency: string;
  onAddStockItem: (item: Omit<StockItem, 'id'>) => void;
  onDeleteStockItem: (id: string) => void;
  onPostStockMovement: (itemId: string, type: 'IN' | 'OUT', qty: number, notes: string) => void;
  language: 'FR' | 'EN' | 'AR';
}

export const StockManager: React.FC<StockManagerProps> = ({
  stockItems,
  stockLedger,
  currency,
  onAddStockItem,
  onDeleteStockItem,
  onPostStockMovement,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'ledger'>('inventory');

  // State for Add Stock Item Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [minStock, setMinStock] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [unit, setUnit] = useState('kg');
  const [unitCost, setUnitCost] = useState('');

  // State for Stock Movement form
  const [movItemId, setMovItemId] = useState('');
  const [movType, setMovType] = useState<'IN' | 'OUT'>('IN');
  const [movQty, setMovQty] = useState('');
  const [movNotes, setMovNotes] = useState('');

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !minStock || !unitCost) return;

    onAddStockItem({
      name,
      category,
      minStock: parseFloat(minStock),
      currentStock: currentStock ? parseFloat(currentStock) : 0,
      unit,
      unitCost: parseFloat(unitCost)
    });

    // Reset Form
    setName('');
    setCategory('');
    setMinStock('');
    setCurrentStock('');
    setUnit('kg');
    setUnitCost('');
  };

  const handlePostMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movItemId || !movQty) return;

    const qty = parseFloat(movQty);
    onPostStockMovement(movItemId, movType, qty, movNotes || (movType === 'IN' ? 'Approvisionnement' : 'Sortie de stock consommation'));

    // Reset
    setMovItemId('');
    setMovQty('');
    setMovNotes('');
  };

  // Metrics
  const totalValuation = stockItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
  const lowStockItems = stockItems.filter(item => item.currentStock <= item.minStock);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C7B6E]">
            {language === 'FR' ? 'Articles Référencés' : 'Items Enrolled'}
          </span>
          <h4 className="text-2xl font-serif font-black text-[#1A1A1A] mt-2">
            {stockItems.length}
          </h4>
          <span className="text-[10px] font-bold text-[#8C7B6E] mt-1">
            {language === 'FR' ? 'Références actives en catalogue' : 'Catalogued materials'}
          </span>
        </div>

        <div className="bg-[#1A1A1A] text-white p-5 rounded-3xl shadow-[3px_3px_0px_0px_rgba(196,164,132,1)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#AFA9A0]">
            {language === 'FR' ? 'Valorisation du Stock' : 'Total Valuation'}
          </span>
          <h4 className="text-2xl font-serif font-black text-[#C4A484] mt-2">
            {currency}{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h4>
          <span className="text-[10px] font-bold text-[#AFA9A0] mt-1">
            {language === 'FR' ? 'Calculé selon coût unitaire moyen' : 'Book value sum (Qty × Unit Cost)'}
          </span>
        </div>

        <div className={`p-5 rounded-3xl border-2 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between ${
          lowStockItems.length > 0 ? 'bg-amber-50 border-amber-800' : 'bg-green-50 border-green-800'
        }`}>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
            {language === 'FR' ? 'Alertes de Stock Bas' : 'Low Stock Alerts'}
          </span>
          <h4 className={`text-2xl font-serif font-black mt-2 ${lowStockItems.length > 0 ? 'text-amber-800' : 'text-green-800'}`}>
            {lowStockItems.length}
          </h4>
          <span className="text-[10px] font-bold mt-1">
            {lowStockItems.length > 0 
              ? (language === 'FR' ? 'Articles sous le seuil d\'alerte !' : 'Action needed - Reorder suggested!')
              : (language === 'FR' ? 'Tout est approvisionné ✓' : 'All stock levels healthy ✓')}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
        {/* Tab switcher */}
        <div className="flex border-b-2 border-[#1A1A1A] bg-[#F9F8F6]">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider border-r-2 border-[#1A1A1A] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventory' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <Package className="w-4 h-4" />
            {language === 'FR' ? 'Inventaire Actif' : 'Active Stock Inventory'}
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ledger' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            {language === 'FR' ? 'Mouvements de Stock' : 'Stock Movement Ledger'}
          </button>
        </div>

        {/* Tab 1: Inventory List */}
        {activeTab === 'inventory' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Add */}
              <div className="bg-[#F3F1ED] p-5 rounded-2xl border-2 border-[#1A1A1A] space-y-4 h-fit">
                <h4 className="font-serif font-black text-sm text-[#1A1A1A] uppercase tracking-wide flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-[#C4A484]" />
                  {language === 'FR' ? 'Nouvel Article' : 'Create Stock Item'}
                </h4>

                <form onSubmit={handleAddItemSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Nom de l\'article' : 'Item Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g., Grains Arabica"
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        Catégorie
                      </label>
                      <input
                        type="text"
                        required
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        placeholder="e.g., Grains, Matière"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        {language === 'FR' ? 'Unité de Mesure' : 'Unit of measure'}
                      </label>
                      <input
                        type="text"
                        required
                        value={unit}
                        onChange={e => setUnit(e.target.value)}
                        placeholder="e.g., kg, Litre, Pièces"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        {language === 'FR' ? 'Stock Min' : 'Min stock'}
                      </label>
                      <input
                        type="number"
                        required
                        value={minStock}
                        onChange={e => setMinStock(e.target.value)}
                        placeholder="10"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        {language === 'FR' ? 'Stock Init' : 'Initial Qty'}
                      </label>
                      <input
                        type="number"
                        value={currentStock}
                        onChange={e => setCurrentStock(e.target.value)}
                        placeholder="25"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        {language === 'FR' ? 'Coût Unit' : 'Unit Cost'}
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={unitCost}
                        onChange={e => setUnitCost(e.target.value)}
                        placeholder="DH"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1A1A1A] hover:bg-[#C4A484] text-white hover:text-[#1A1A1A] py-2.5 font-extrabold uppercase text-xs tracking-wider rounded-xl border-2 border-[#1A1A1A] transition cursor-pointer mt-2"
                  >
                    {language === 'FR' ? 'Enregistrer l\'article' : 'Enroll Item'}
                  </button>
                </form>
              </div>

              {/* Items List Table */}
              <div className="lg:col-span-2 overflow-x-auto">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead>
                    <tr className="bg-[#F3F1ED] text-[#8C7B6E] uppercase font-bold text-[10px] border-b border-[#1A1A1A]/10">
                      <th className="py-3 px-4">{language === 'FR' ? 'Désignation de l\'article' : 'Stock Item Name'}</th>
                      <th className="py-3 px-4">Catégorie</th>
                      <th className="py-3 px-4 text-center">{language === 'FR' ? 'Seuil Min' : 'Safety Qty'}</th>
                      <th className="py-3 px-4 text-center bg-gray-50">{language === 'FR' ? 'Niveau Actuel' : 'Stock Level'}</th>
                      <th className="py-3 px-4 text-right">{language === 'FR' ? 'Coût Unitaire' : 'Unit Cost'}</th>
                      <th className="py-3 px-4 text-right">{language === 'FR' ? 'Valeur Livre' : 'Valuation'}</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockItems.map(item => {
                      const isLow = item.currentStock <= item.minStock;
                      const value = item.currentStock * item.unitCost;
                      return (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#1A1A1A]">{item.name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-gray-50 text-gray-700 rounded-md border border-gray-100 text-[10px] font-bold">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-[#8C7B6E] font-bold">
                            {item.minStock} <span className="text-[10px] uppercase font-bold text-gray-400">{item.unit}</span>
                          </td>
                          <td className={`py-3 px-4 text-center font-mono font-black bg-gray-50/50 ${
                            isLow ? 'text-amber-800' : 'text-green-800'
                          }`}>
                            <div className="flex items-center justify-center gap-1">
                              {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                              <span>{item.currentStock} {item.unit}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-600">
                            {currency}{item.unitCost.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#1A1A1A]">
                            {currency}{value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => onDeleteStockItem(item.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition border border-transparent hover:border-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {stockItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400 italic">
                          {language === 'FR' ? 'Aucun article répertorié.' : 'No stock items listed.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Ledger Movements */}
        {activeTab === 'ledger' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Ledger entry */}
              <div className="bg-[#F3F1ED] p-5 rounded-2xl border-2 border-[#1A1A1A] space-y-4 h-fit">
                <h4 className="font-serif font-black text-sm text-[#1A1A1A] uppercase tracking-wide flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-[#C4A484]" />
                  {language === 'FR' ? 'Enregistrer un mouvement' : 'Log Movement'}
                </h4>

                <form onSubmit={handlePostMovementSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Sélectionner l\'article' : 'Select Item'}
                    </label>
                    <select
                      required
                      value={movItemId}
                      onChange={e => setMovItemId(e.target.value)}
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2.5 rounded-xl text-xs outline-none font-bold text-[#1A1A1A]"
                    >
                      <option value="">-- {language === 'FR' ? 'Choisir' : 'Choose'} --</option>
                      {stockItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({language === 'FR' ? 'En stock' : 'Stock'} : {item.currentStock} {item.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        {language === 'FR' ? 'Type Mouvement' : 'Movement Type'}
                      </label>
                      <select
                        value={movType}
                        onChange={e => setMovType(e.target.value as 'IN' | 'OUT')}
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none font-bold text-[#1A1A1A]"
                      >
                        <option value="IN">{language === 'FR' ? 'Entrée (IN)' : 'Entry (IN)'}</option>
                        <option value="OUT">{language === 'FR' ? 'Sortie (OUT)' : 'Dispatch (OUT)'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        {language === 'FR' ? 'Quantité' : 'Quantity'}
                      </label>
                      <input
                        type="number"
                        required
                        step="0.1"
                        value={movQty}
                        onChange={e => setMovQty(e.target.value)}
                        placeholder="e.g., 5"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      Notes / Observations
                    </label>
                    <input
                      type="text"
                      value={movNotes}
                      onChange={e => setMovNotes(e.target.value)}
                      placeholder="e.g., Facture Carrion, Consommation"
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!movItemId}
                    className="w-full bg-green-800 hover:bg-[#1A1A1A] text-white py-2.5 font-extrabold uppercase text-xs tracking-wider rounded-xl transition cursor-pointer mt-2"
                  >
                    {language === 'FR' ? 'Valider le mouvement' : 'Post Movement'}
                  </button>
                </form>
              </div>

              {/* Movement timeline */}
              <div className="lg:col-span-2 overflow-x-auto">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead>
                    <tr className="bg-[#F3F1ED] text-[#8C7B6E] uppercase font-bold text-[10px] border-b border-[#1A1A1A]/10">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">{language === 'FR' ? 'Article' : 'Stock Item'}</th>
                      <th className="py-3 px-4 text-center">{language === 'FR' ? 'Sens' : 'Direction'}</th>
                      <th className="py-3 px-4 text-right">{language === 'FR' ? 'Quantité' : 'Quantity'}</th>
                      <th className="py-3 px-4">{language === 'FR' ? 'Remarques' : 'Notes'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockLedger.map(lg => (
                      <tr key={lg.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-mono font-semibold text-gray-500">{lg.date}</td>
                        <td className="py-3 px-4 font-bold text-[#1A1A1A]">{lg.itemName}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-extrabold border ${
                            lg.type === 'IN' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {lg.type === 'IN' ? (
                              <>
                                <ArrowUpRight className="w-3 h-3 text-green-700" />
                                ENTREE
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="w-3 h-3 text-amber-700" />
                                SORTIE
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#1A1A1A]">
                          {lg.quantity}
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-medium italic">{lg.notes}</td>
                      </tr>
                    ))}
                    {stockLedger.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400 italic">
                          {language === 'FR' ? 'Aucun mouvement enregistré.' : 'No stock movements logged.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
