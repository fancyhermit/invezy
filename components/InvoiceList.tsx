import React, { useState, useMemo } from 'react';
import { Invoice, Customer } from '../types';
// Fixed: Added ChevronDown to imports from lucide-react
import { Download, Search, Filter, MoreVertical, Plus, Edit2, Trash2, Printer, Check, X, CreditCard, Clock, AlertCircle, ChevronDown } from 'lucide-react';

interface Props {
  invoices: Invoice[];
  customers: Customer[];
  onAdd: () => void;
  onEdit: (invoice: Invoice) => void;
  onPrint: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  onDelete?: (id: string) => void;
  onUpdateInvoice: (invoice: Invoice) => void;
}

const InvoiceList: React.FC<Props> = ({ invoices, customers, onAdd, onEdit, onPrint, onDownload, onDelete, onUpdateInvoice }) => {
  const [menuConfig, setMenuConfig] = useState<{ id: string, x: number, y: number } | null>(null);
  const [statusMenuConfig, setStatusMenuConfig] = useState<{ id: string, x: number, y: number } | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'OVERDUE'>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // 1. Search Query
      const customer = customers.find(c => c.id === inv.customerId);
      const customerName = customer?.name || 'Walk-in Customer';
      const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           customerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Status Filter
      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

      // 3. Date Filter
      let matchesDate = true;
      if (dateRangeFilter !== 'ALL') {
        const invDate = new Date(inv.date);
        const now = new Date();
        if (dateRangeFilter === 'TODAY') {
          matchesDate = invDate.toDateString() === now.toDateString();
        } else if (dateRangeFilter === 'WEEK') {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          matchesDate = invDate >= weekAgo;
        } else if (dateRangeFilter === 'MONTH') {
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          matchesDate = invDate >= monthAgo;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoices, customers, searchQuery, statusFilter, dateRangeFilter]);

  const handleMenuClick = (e: React.MouseEvent, inv: Invoice) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuConfig({
      id: inv.id,
      x: rect.right - 200,
      y: rect.bottom + 8
    });
    setStatusMenuConfig(null);
  };

  const handleStatusBadgeClick = (e: React.MouseEvent, inv: Invoice) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setStatusMenuConfig({
      id: inv.id,
      x: rect.left,
      y: rect.bottom + 8
    });
    setMenuConfig(null);
  };

  const closeMenu = () => {
    setMenuConfig(null);
    setStatusMenuConfig(null);
  };

  const handleStatusUpdate = (id: string, newStatus: 'PAID' | 'UNPAID' | 'OVERDUE') => {
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      onUpdateInvoice({ ...inv, status: newStatus });
    }
    closeMenu();
  };

  const handleAction = (action: 'edit' | 'print' | 'delete' | 'download' | 'status_paid' | 'status_unpaid') => {
    if (!menuConfig) return;
    const inv = invoices.find(i => i.id === menuConfig.id);
    if (!inv) return;

    if (action === 'edit') onEdit(inv);
    if (action === 'print') onPrint(inv);
    if (action === 'download') onDownload(inv);
    if (action === 'delete' && onDelete) onDelete(inv.id);
    if (action === 'status_paid') handleStatusUpdate(inv.id, 'PAID');
    if (action === 'status_unpaid') handleStatusUpdate(inv.id, 'UNPAID');
    
    closeMenu();
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setDateRangeFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 text-left relative overflow-visible">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Invoices</h2>
          <p className="text-gray-500 font-medium">Track and manage all your sales transactions.</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                showFilterMenu || statusFilter !== 'ALL' || dateRangeFilter !== 'ALL'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter size={18} />
              <span>Filter</span>
              {(statusFilter !== 'ALL' || dateRangeFilter !== 'ALL') && (
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              )}
            </button>

            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-[150] bg-black/5" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 z-[160] p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs uppercase tracking-widest text-gray-400">Apply Filters</h4>
                    <button onClick={clearFilters} className="text-[10px] font-black text-indigo-600 hover:underline uppercase">Reset All</button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['ALL', 'PAID', 'UNPAID', 'OVERDUE'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status as any)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                            statusFilter === status 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Time Period</p>
                    <div className="space-y-1">
                      {[
                        { id: 'ALL', label: 'All Time' },
                        { id: 'TODAY', label: 'Today' },
                        { id: 'WEEK', label: 'Last 7 Days' },
                        { id: 'MONTH', label: 'Last 30 Days' }
                      ].map((range) => (
                        <button
                          key={range.id}
                          onClick={() => setDateRangeFilter(range.id as any)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                            dateRangeFilter === range.id 
                              ? 'bg-indigo-50 text-indigo-600' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span>{range.label}</span>
                          {dateRangeFilter === range.id && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowFilterMenu(false)}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>

          <button onClick={onAdd} className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
            <Plus size={18} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, customer name..." 
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-2xl text-sm font-bold text-gray-700 placeholder:text-gray-300 outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Invoice #</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Date</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Customer</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Total Amount</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Status</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[2px] w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-6 rounded-full text-gray-300 mb-6 border border-gray-100">
                        <Search size={48} />
                      </div>
                      <p className="text-gray-500 font-bold text-lg mb-2">No invoices found.</p>
                      <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search terms.</p>
                      <button onClick={clearFilters} className="text-indigo-600 font-black text-sm uppercase tracking-widest hover:underline">Reset All Filters</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const customer = customers.find(c => c.id === inv.customerId);
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="font-black text-indigo-600 group-hover:underline cursor-pointer tracking-tight" onClick={() => onEdit(inv)}>{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-500">
                        {new Date(inv.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-gray-900">
                        {customer?.name || 'Walk-in Customer'}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-base font-black text-gray-900">
                        ₹{inv.grandTotal.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <button 
                          onClick={(e) => handleStatusBadgeClick(e, inv)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center mx-auto space-x-1 ${
                            inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                            inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          <span>{inv.status}</span>
                          <ChevronDown size={10} className="opacity-50" />
                        </button>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <button 
                          onClick={(e) => handleMenuClick(e, inv)}
                          className={`p-2.5 rounded-xl transition-all ${menuConfig?.id === inv.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {statusMenuConfig && (
        <>
          <div className="fixed inset-0 z-[100] bg-transparent" onClick={closeMenu} />
          <div 
            className="fixed z-[110] w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ top: statusMenuConfig.y, left: statusMenuConfig.x }}
          >
            <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Update Status</span>
            </div>
            {[
              { id: 'PAID', label: 'Mark as Paid', icon: CreditCard, color: 'text-green-600' },
              { id: 'UNPAID', label: 'Mark as Unpaid', icon: Clock, color: 'text-orange-600' },
              { id: 'OVERDUE', label: 'Mark as Overdue', icon: AlertCircle, color: 'text-red-600' }
            ].map(s => (
              <button 
                key={s.id}
                onClick={() => handleStatusUpdate(statusMenuConfig.id, s.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors text-left`}
              >
                <s.icon size={14} className={s.color} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      
      {menuConfig && (
        <>
          <div className="fixed inset-0 z-[100] bg-transparent" onClick={closeMenu} />
          <div 
            className="fixed z-[110] w-56 bg-white rounded-[24px] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ top: menuConfig.y, left: menuConfig.x }}
          >
            <button 
              onClick={() => handleAction('edit')}
              className="w-full flex items-center space-x-3 px-5 py-4 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left"
            >
              <Edit2 size={16} className="text-indigo-500" />
              <span className="font-bold">Edit Invoice</span>
            </button>
            
            {invoices.find(i => i.id === menuConfig.id)?.status !== 'PAID' ? (
              <button 
                onClick={() => handleAction('status_paid')}
                className="w-full flex items-center space-x-3 px-5 py-4 text-sm text-green-600 hover:bg-green-50 transition-colors text-left"
              >
                <CreditCard size={16} />
                <span className="font-bold">Mark as Paid</span>
              </button>
            ) : (
              <button 
                onClick={() => handleAction('status_unpaid')}
                className="w-full flex items-center space-x-3 px-5 py-4 text-sm text-orange-600 hover:bg-orange-50 transition-colors text-left"
              >
                <Clock size={16} />
                <span className="font-bold">Mark as Unpaid</span>
              </button>
            )}

            <button 
              onClick={() => handleAction('print')}
              className="w-full flex items-center space-x-3 px-5 py-4 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left"
            >
              <Printer size={16} className="text-gray-400" />
              <span className="font-bold">Print Bill</span>
            </button>
            <button 
              onClick={() => handleAction('download')}
              className="w-full flex items-center space-x-3 px-5 py-4 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left"
            >
              <Download size={16} className="text-gray-400" />
              <span className="font-bold">Download PDF</span>
            </button>
            <div className="h-px bg-gray-100 mx-2 my-1"></div>
            <button 
              onClick={() => handleAction('delete')}
              className="w-full flex items-center space-x-3 px-5 py-4 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <Trash2 size={16} />
              <span className="font-bold">Delete Bill</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceList;