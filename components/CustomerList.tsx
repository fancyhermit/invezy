
import React, { useState, useMemo } from 'react';
import { Customer, Invoice } from '../types';
import { UserPlus, Mail, Phone, MapPin, Search, X, Save, Trash2, History, IndianRupee, FileText, ChevronRight } from 'lucide-react';

interface Props {
  customers: Customer[];
  invoices: Invoice[];
  onUpdate: (updated: Customer[]) => void;
}

const CustomerList: React.FC<Props> = ({ customers, invoices, onUpdate }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', email: '', address: '', type: 'REGULAR' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData(c);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      alert("Name and Phone are required.");
      return;
    }
    
    if (editingCustomer) {
      const updatedList = customers.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...formData } as Customer : c);
      onUpdate([...updatedList]);
    } else {
      const newCustomer: Customer = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as Customer;
      onUpdate([...customers, newCustomer]);
    }
    setIsFormOpen(false);
  };

  const confirmDelete = (id: string) => {
    if (window.confirm("Permanently delete this contact? This will not affect existing invoices.")) {
      const remaining = customers.filter(c => c.id !== id);
      onUpdate([...remaining]);
    }
  };

  // Logic for history view
  const customerInvoices = useMemo(() => {
    if (!historyCustomer) return [];
    return invoices
      .filter(inv => inv.customerId === historyCustomer.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [historyCustomer, invoices]);

  const historyStats = useMemo(() => {
    if (customerInvoices.length === 0) return { total: 0, count: 0, pending: 0 };
    return {
      total: customerInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
      count: customerInvoices.length,
      pending: customerInvoices.filter(inv => inv.status !== 'PAID').length
    };
  }, [customerInvoices]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 overflow-visible">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-black text-gray-900">Customers</h2>
          <p className="text-gray-500 font-medium">Maintain relationships and track billing history.</p>
        </div>
        <button 
          type="button"
          onClick={handleOpenAdd} 
          className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          <UserPlus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 flex items-center">
        <Search className="text-gray-400 mr-4" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          className="flex-1 bg-transparent border-none focus:ring-0 outline-none font-bold text-gray-700 placeholder:text-gray-300"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="md:col-span-2 py-20 text-center text-gray-400 font-bold bg-white rounded-[40px] border-2 border-dashed border-gray-100">
            No contacts matching your search
          </div>
        ) : (
          filteredCustomers.map(c => (
            <div key={c.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-[20px] flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-100">
                    {c.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-xl text-gray-900">{c.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block mt-1 ${c.type === 'PREMIUM' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                      {c.type || 'REGULAR'} CLIENT
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                   <button 
                    type="button"
                    onClick={() => confirmDelete(c.id)} 
                    className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    title="Delete Contact"
                   >
                     <Trash2 size={24} />
                   </button>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center text-sm text-gray-600 space-x-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                  <Phone size={18} className="text-indigo-400" />
                  <span className="font-bold">{c.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 space-x-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                  <Mail size={18} className="text-indigo-400" />
                  <span className="font-medium">{c.email}</span>
                </div>
                <div className="flex items-start text-sm text-gray-600 space-x-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                  <MapPin size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{c.address}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <button 
                  type="button" 
                  onClick={() => setHistoryCustomer(c)}
                  className="flex items-center space-x-2 text-sm font-black text-indigo-600 hover:scale-105 transition-all"
                >
                  <History size={16} />
                  <span>VIEW HISTORY</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleOpenEdit(c)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[2px] shadow-lg shadow-indigo-100 hover:scale-105 transition-all active:scale-95"
                >
                  Edit Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* History Modal */}
      {historyCustomer && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-50 rounded-[40px] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-white/20">
            <div className="p-8 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">
                  {historyCustomer.name.charAt(0)}
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-black text-gray-900 leading-none">{historyCustomer.name}</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Transaction History</p>
                </div>
              </div>
              <button onClick={() => setHistoryCustomer(null)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-8">
              {customerInvoices.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <div className="p-6 bg-white rounded-full text-gray-200">
                    <FileText size={48} />
                  </div>
                  <p className="font-bold text-gray-400">No transactions found for this customer.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-[24px] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Spent</p>
                      <div className="flex items-center text-2xl font-black text-gray-900">
                        <IndianRupee size={18} className="mr-0.5 text-indigo-600" />
                        {historyStats.total.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-[24px] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Invoices</p>
                      <div className="flex items-center justify-between">
                         <span className="text-2xl font-black text-gray-900">{historyStats.count}</span>
                         {historyStats.pending > 0 && (
                           <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                             {historyStats.pending} PENDING
                           </span>
                         )}
                      </div>
                    </div>
                  </div>

                  {/* List */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Recent Transactions</p>
                    <div className="divide-y divide-gray-100 bg-white rounded-[32px] border border-gray-100 overflow-hidden">
                      {customerInvoices.map(inv => (
                        <div key={inv.id} className="p-5 flex items-center justify-between hover:bg-indigo-50/30 transition-colors group cursor-pointer">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inv.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                              <FileText size={18} />
                            </div>
                            <div className="text-left">
                              <p className="font-black text-sm text-gray-900">{inv.invoiceNumber}</p>
                              <p className="text-[10px] font-bold text-gray-400">{new Date(inv.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-black text-sm text-gray-900">₹{inv.grandTotal.toLocaleString()}</p>
                              <span className={`text-[8px] font-black uppercase tracking-widest ${inv.status === 'PAID' ? 'text-green-500' : 'text-orange-500'}`}>
                                {inv.status}
                              </span>
                            </div>
                            <ChevronRight size={16} className="text-gray-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-white border-t border-gray-100 flex justify-center shrink-0">
               <button 
                onClick={() => setHistoryCustomer(null)}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200"
               >
                 Close History
               </button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-gray-900">{editingCustomer ? 'Update Profile' : 'New Customer'}</h3>
               <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
            </div>

            <div className="space-y-6 text-left">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer Name</label>
                <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg" placeholder="e.g. Acme Corp"/>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                  <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"/>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                  <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Client Type</label>
                <div className="flex space-x-2">
                   {['REGULAR', 'PREMIUM'].map(type => (
                     <button 
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, type: type as any})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${formData.type === type ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                     >
                       {type}
                     </button>
                   ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Address</label>
                <textarea value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none h-24 text-sm font-medium resize-none" placeholder="Enter billing address..."/>
              </div>
            </div>

            <div className="mt-10 flex justify-end space-x-4">
               <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 text-gray-400 font-bold hover:text-gray-600 transition-colors">Cancel</button>
               <button type="button" onClick={handleSave} className="flex items-center space-x-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                 <Save size={20} />
                 <span>{editingCustomer ? 'Update' : 'Create Customer'}</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
