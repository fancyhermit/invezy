
import React, { useState, useRef, useEffect } from 'react';
import { Invoice } from '../types';
import { Download, Search, Filter, MoreVertical, Plus, Edit2, Trash2, Printer } from 'lucide-react';

interface Props {
  invoices: Invoice[];
  onAdd: () => void;
  onEdit: (invoice: Invoice) => void;
  onDelete?: (id: string) => void;
}

const InvoiceList: React.FC<Props> = ({ invoices, onAdd, onEdit, onDelete }) => {
  const [menuConfig, setMenuConfig] = useState<{ id: string, x: number, y: number } | null>(null);

  const handleMenuClick = (e: React.MouseEvent, inv: Invoice) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    // Position menu below and to the left of the button
    setMenuConfig({
      id: inv.id,
      x: rect.right - 200, // Width of menu is roughly 200px
      y: rect.bottom + 8
    });
  };

  const closeMenu = () => setMenuConfig(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-500">Track and manage all your sales transactions.</p>
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button onClick={onAdd} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all active:scale-95">
            <Plus size={18} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by invoice #, customer name..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 p-4 rounded-full text-gray-400 mb-4">
                        <Search size={40} />
                      </div>
                      <p className="text-gray-500 font-medium">No invoices found.</p>
                      <button onClick={onAdd} className="mt-4 text-indigo-600 font-bold hover:underline">Create your first invoice</button>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-indigo-600 group-hover:underline cursor-pointer">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(inv.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Walk-in Customer
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black">
                      ₹{inv.grandTotal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                        inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={(e) => handleMenuClick(e, inv)}
                        className={`p-2 rounded-lg transition-all ${menuConfig?.id === inv.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                      >
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Fixed Dropdown Menu - Portal-like behavior */}
      {menuConfig && (
        <>
          <div 
            className="fixed inset-0 z-[100] bg-black/5" 
            onClick={closeMenu}
          />
          <div 
            className="fixed z-[110] w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ top: menuConfig.y, left: menuConfig.x }}
          >
            <button 
              onClick={() => {
                const inv = invoices.find(i => i.id === menuConfig.id);
                if (inv) onEdit(inv);
                closeMenu();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left"
            >
              <Edit2 size={16} className="text-indigo-500" />
              <span className="font-bold">Edit Invoice</span>
            </button>
            <button 
              className="w-full flex items-center space-x-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left"
            >
              <Printer size={16} className="text-gray-400" />
              <span className="font-bold">Print Bill</span>
            </button>
            <button 
              className="w-full flex items-center space-x-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left"
            >
              <Download size={16} className="text-gray-400" />
              <span className="font-bold">Download PDF</span>
            </button>
            <div className="h-px bg-gray-100 mx-2 my-1"></div>
            <button 
              onClick={() => {
                if(onDelete) onDelete(menuConfig.id);
                closeMenu();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
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
