import React, { useState } from 'react';
import { Supplier, PurchaseOrder, EstablishmentInfo } from '../types';
import { Truck, PlusCircle, CreditCard, DollarSign, List, Shield, User, Trash2, CheckCircle } from 'lucide-react';

interface SupplierManagerProps {
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
  currency: string;
  establishment: EstablishmentInfo;
  onAddSupplier: (sup: Omit<Supplier, 'id' | 'totalPurchases' | 'amountDue'>) => void;
  onAddPurchase: (order: Omit<PurchaseOrder, 'id'>) => void;
  onAmortizeDue: (supplierId: string, amountToPay: number) => void;
  language: 'FR' | 'EN' | 'AR';
}

export const SupplierManager: React.FC<SupplierManagerProps> = ({
  suppliers,
  purchases,
  currency,
  establishment,
  onAddSupplier,
  onAddPurchase,
  onAmortizeDue,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'orders'>('suppliers');
  
  // State for Add Supplier form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ice, setIce] = useState('');
  const [contact, setContact] = useState('');

  // State for Add Purchase order form
  const [selectedSupId, setSelectedSupId] = useState('');
  const [itemsDesc, setItemsDesc] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');

  // State for Pay Due balance modal/form
  const [payingSupId, setPayingSupId] = useState('');
  const [payAmount, setPayAmount] = useState('');

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddSupplier({
      name,
      phone: phone || '+212 522 00 00 00',
      email: email || 'contact@fournisseur.ma',
      ice: ice || '001234567890123',
      contactPerson: contact || 'Directeur Ventes'
    });

    // Reset Form
    setName('');
    setPhone('');
    setEmail('');
    setIce('');
    setContact('');
  };

  const handleAddPurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupId || !itemsDesc.trim() || !totalAmount) return;

    const total = parseFloat(totalAmount);
    const paid = paidAmount ? parseFloat(paidAmount) : 0;
    
    let status: PurchaseOrder['status'] = 'Pending';
    if (paid >= total) status = 'Paid';
    else if (paid > 0) status = 'Partial';

    onAddPurchase({
      date: new Date().toISOString().split('T')[0],
      supplierId: selectedSupId,
      supplierName: suppliers.find(s => s.id === selectedSupId)?.name || 'Fournisseur',
      itemsDescription: itemsDesc,
      totalAmount: total,
      paidAmount: paid,
      status
    });

    // Reset Form
    setSelectedSupId('');
    setItemsDesc('');
    setTotalAmount('');
    setPaidAmount('');
  };

  const handlePayDueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSupId || !payAmount) return;

    onAmortizeDue(payingSupId, parseFloat(payAmount));
    setPayingSupId('');
    setPayAmount('');
  };

  // KPIs
  const totalPurchaseVolume = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalAmountPaid = purchases.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalOutstandingDue = suppliers.reduce((sum, s) => sum + s.amountDue, 0);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C7B6E]">
            {language === 'FR' ? 'Volume Total d\'Achats' : 'Total Purchase Volume'}
          </span>
          <h4 className="text-2xl font-serif font-black text-[#1A1A1A] mt-2">
            {currency}{totalPurchaseVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h4>
          <span className="text-[10px] font-bold text-[#8C7B6E] mt-1">
            {language === 'FR' ? `${purchases.length} commandes passées` : `${purchases.length} purchase orders logged`}
          </span>
        </div>

        <div className="bg-[#1A1A1A] text-white p-5 rounded-3xl shadow-[3px_3px_0px_0px_rgba(196,164,132,1)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#AFA9A0]">
            {language === 'FR' ? 'Montant Total Payé' : 'Total Amount Settled'}
          </span>
          <h4 className="text-2xl font-serif font-black text-[#C4A484] mt-2">
            {currency}{totalAmountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h4>
          <span className="text-[10px] font-bold text-green-500 mt-1">
            {language === 'FR' ? 'Règlements fournisseurs enregistrés' : 'Settled balances recorded'}
          </span>
        </div>

        <div className="bg-amber-50 p-5 rounded-3xl border-2 border-amber-800 shadow-[3px_3px_0px_0px_rgba(146,64,14,1)] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800/80">
            {language === 'FR' ? 'Créances / Dettes Fournisseurs' : 'Outstanding Amount Due'}
          </span>
          <h4 className="text-2xl font-serif font-black text-amber-900 mt-2">
            {currency}{totalOutstandingDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h4>
          <span className="text-[10px] font-bold text-amber-800 mt-1">
            {language === 'FR' ? 'Reste à régler aux fournisseurs' : 'Total accounts payable outstanding'}
          </span>
        </div>
      </div>

      {/* Main Panel Box */}
      <div className="bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
        {/* Tab Selector */}
        <div className="flex border-b-2 border-[#1A1A1A] bg-[#F9F8F6]">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider border-r-2 border-[#1A1A1A] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'suppliers' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <Truck className="w-4 h-4" />
            {language === 'FR' ? 'Annuaire des Fournisseurs' : 'Supplier Directory'}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-white text-[#1A1A1A]' : 'text-[#8C7B6E] hover:bg-white/50 hover:text-[#1A1A1A]'
            }`}
          >
            <List className="w-4 h-4" />
            {language === 'FR' ? 'Journal d\'Achats & Commandes' : 'Purchases Ledger'}
          </button>
        </div>

        {/* Supplier Directory Tab */}
        {activeTab === 'suppliers' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Supplier Form */}
              <div className="bg-[#F3F1ED] p-5 rounded-2xl border-2 border-[#1A1A1A] space-y-4 h-fit">
                <h4 className="font-serif font-black text-sm text-[#1A1A1A] uppercase tracking-wide flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-[#C4A484]" />
                  {language === 'FR' ? 'Nouveau Fournisseur' : 'Add Supplier'}
                </h4>

                <form onSubmit={handleAddSupplierSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Raison Sociale / Nom' : 'Supplier Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g., Maroc Café Gros"
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      ICE (15 chiffres)
                    </label>
                    <input
                      type="text"
                      value={ice}
                      onChange={e => setIce(e.target.value)}
                      placeholder="e.g., 001948521000155"
                      maxLength={15}
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Contact / Représentant' : 'Contact Person'}
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={e => setContact(e.target.value)}
                      placeholder="e.g., Amine Mansouri"
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        {language === 'FR' ? 'Téléphone' : 'Phone'}
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+212 522..."
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="contact@email.ma"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1A1A1A] hover:bg-[#C4A484] text-white hover:text-[#1A1A1A] py-2.5 font-extrabold uppercase text-xs tracking-wider rounded-xl border-2 border-[#1A1A1A] transition cursor-pointer mt-2"
                  >
                    {language === 'FR' ? 'Créer le Fournisseur' : 'Register Supplier'}
                  </button>
                </form>
              </div>

              {/* Suppliers List Table */}
              <div className="lg:col-span-2 space-y-4">
                {/* Pay Outstanding Due inline mini form */}
                {payingSupId && (
                  <div className="bg-amber-50 border-2 border-[#1A1A1A] rounded-2xl p-4 flex flex-col sm:flex-row items-end justify-between gap-4 shadow-sm animate-fade-in">
                    <div className="flex-1 space-y-2">
                      <h5 className="text-xs font-black text-amber-900 uppercase">
                        {language === 'FR' 
                          ? `Enregistrer un règlement pour : ${suppliers.find(s => s.id === payingSupId)?.name}` 
                          : `Settle Account Due for: ${suppliers.find(s => s.id === payingSupId)?.name}`}
                      </h5>
                      <p className="text-[10px] text-amber-800 font-semibold">
                        {language === 'FR'
                          ? `Dette actuelle : ${currency}${suppliers.find(s => s.id === payingSupId)?.amountDue.toLocaleString()}`
                          : `Active payable: ${currency}${suppliers.find(s => s.id === payingSupId)?.amountDue.toLocaleString()}`}
                      </p>
                    </div>
                    <form onSubmit={handlePayDueSubmit} className="flex gap-2 w-full sm:w-auto shrink-0">
                      <input
                        type="number"
                        required
                        max={suppliers.find(s => s.id === payingSupId)?.amountDue}
                        value={payAmount}
                        onChange={e => setPayAmount(e.target.value)}
                        placeholder="DH"
                        className="bg-white border-2 border-[#1A1A1A] px-3 py-1.5 rounded-xl text-xs w-28 text-[#1A1A1A] font-bold"
                      />
                      <button
                        type="submit"
                        className="bg-amber-800 hover:bg-[#1A1A1A] text-white font-extrabold uppercase text-[10px] px-4 py-2 rounded-xl cursor-pointer"
                      >
                        {language === 'FR' ? 'Régler' : 'Pay'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayingSupId('')}
                        className="text-xs font-bold text-gray-500 hover:text-gray-900 underline px-2"
                      >
                        {language === 'FR' ? 'Annuler' : 'Cancel'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium border-collapse">
                    <thead>
                      <tr className="bg-[#F3F1ED] text-[#8C7B6E] uppercase font-bold text-[10px] border-b border-[#1A1A1A]/10">
                        <th className="py-3 px-4">{language === 'FR' ? 'Raison Sociale' : 'Supplier'}</th>
                        <th className="py-3 px-4">ICE / Représentant</th>
                        <th className="py-3 px-4">{language === 'FR' ? 'Coordonnées' : 'Contact'}</th>
                        <th className="py-3 px-4 text-right">{language === 'FR' ? 'Volume Achat' : 'Purchase Vol.'}</th>
                        <th className="py-3 px-4 text-right text-amber-800 bg-amber-50">{language === 'FR' ? 'Reste dû' : 'Due Amount'}</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map(sup => (
                        <tr key={sup.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-bold text-[#1A1A1A]">{sup.name}</td>
                          <td className="py-3 px-4">
                            <div className="text-[10px] font-mono text-gray-500">ICE: {sup.ice}</div>
                            <div className="font-semibold text-gray-800">{sup.contactPerson}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-600">{sup.phone}</div>
                            <div className="text-[10px] text-gray-400 font-medium">{sup.email}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-gray-700">
                            {currency}{sup.totalPurchases.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-black text-amber-900 bg-amber-50">
                            {currency}{sup.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {sup.amountDue > 0 ? (
                              <button
                                onClick={() => { setPayingSupId(sup.id); setPayAmount(''); }}
                                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-800 hover:text-white border border-amber-300 text-amber-950 text-[10px] font-black rounded-lg cursor-pointer transition uppercase"
                              >
                                {language === 'FR' ? 'Payer Dû' : 'Settle'}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-green-700 font-bold text-[10px] uppercase">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {language === 'FR' ? 'À Jour' : 'Settled'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {suppliers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-400 italic">
                            {language === 'FR' ? 'Aucun fournisseur enregistré.' : 'No suppliers registered.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Ledger Tab */}
        {activeTab === 'orders' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Column */}
              <div className="bg-[#F3F1ED] p-5 rounded-2xl border-2 border-[#1A1A1A] space-y-4 h-fit">
                <h4 className="font-serif font-black text-sm text-[#1A1A1A] uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#C4A484]" />
                  {language === 'FR' ? 'Enregistrer un Achat' : 'Log Purchase Order'}
                </h4>

                <form onSubmit={handleAddPurchaseSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Sélectionner Fournisseur' : 'Select Supplier'}
                    </label>
                    <select
                      required
                      value={selectedSupId}
                      onChange={e => setSelectedSupId(e.target.value)}
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none font-bold text-[#1A1A1A]"
                    >
                      <option value="">-- {language === 'FR' ? 'Choisir' : 'Choose'} --</option>
                      {suppliers.map(sup => (
                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                      {language === 'FR' ? 'Désignation des Articles' : 'Items Description'}
                    </label>
                    <textarea
                      required
                      value={itemsDesc}
                      onChange={e => setItemsDesc(e.target.value)}
                      placeholder="e.g., Achat de 30kg grains café + lait"
                      rows={2}
                      className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        {language === 'FR' ? 'Montant Total' : 'Total Amount'}
                      </label>
                      <input
                        type="number"
                        required
                        value={totalAmount}
                        onChange={e => setTotalAmount(e.target.value)}
                        placeholder="DH"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#8C7B6E] uppercase mb-1">
                        {language === 'FR' ? 'Acompte versé' : 'Deposit Paid'}
                      </label>
                      <input
                        type="number"
                        value={paidAmount}
                        onChange={e => setPaidAmount(e.target.value)}
                        placeholder="DH"
                        className="w-full bg-white border-2 border-[#1A1A1A] px-3 py-2 rounded-xl text-xs outline-none text-[#1A1A1A] font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-800 hover:bg-[#1A1A1A] text-white py-2.5 font-extrabold uppercase text-xs tracking-wider rounded-xl border border-transparent transition cursor-pointer mt-2"
                  >
                    {language === 'FR' ? 'Enregistrer la commande' : 'Log Invoice'}
                  </button>
                </form>
              </div>

              {/* Purchase Ledger Table */}
              <div className="lg:col-span-2 overflow-x-auto">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead>
                    <tr className="bg-[#F3F1ED] text-[#8C7B6E] uppercase font-bold text-[10px] border-b border-[#1A1A1A]/10">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">{language === 'FR' ? 'Fournisseur' : 'Supplier'}</th>
                      <th className="py-3 px-4">{language === 'FR' ? 'Désignation' : 'Description'}</th>
                      <th className="py-3 px-4 text-right">{language === 'FR' ? 'Total' : 'Total'}</th>
                      <th className="py-3 px-4 text-right">{language === 'FR' ? 'Payé' : 'Paid'}</th>
                      <th className="py-3 px-4 text-center">{language === 'FR' ? 'Statut' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map(order => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 font-mono font-semibold text-gray-500">{order.date}</td>
                        <td className="py-3.5 px-4 font-bold text-[#1A1A1A]">{order.supplierName}</td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-gray-700 font-medium">{order.itemsDescription}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1A1A1A]">
                          {currency}{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-green-700">
                          {currency}{order.paidAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                            order.status === 'Paid'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : order.status === 'Partial'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {order.status === 'Paid' ? (language === 'FR' ? 'RÉGLÉ' : 'PAID') : order.status === 'Partial' ? (language === 'FR' ? 'PARTIEL' : 'PARTIAL') : (language === 'FR' ? 'DÛ' : 'PENDING')}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {purchases.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400 italic">
                          {language === 'FR' ? 'Aucune commande enregistrée.' : 'No purchases logged.'}
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
