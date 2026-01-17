
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Customer, Invoice, LineItem, BusinessProfile, InvoiceTemplate } from '../types';
import { Trash2, Plus, ChevronLeft, Eye, Edit3, Download, Share2, Printer, FileCode, Edit2, ChevronDown, Layout, CheckCircle, X, ShieldCheck } from 'lucide-react';
import { downloadTallyFile } from '../services/tallyService';

interface Props {
  products: Product[];
  customers: Customer[];
  activeProfile: BusinessProfile;
  activeTemplate: InvoiceTemplate; 
  allTemplates: InvoiceTemplate[]; 
  initialInvoice?: Invoice;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

const InvoiceForm: React.FC<Props> = ({ products, customers, activeProfile, activeTemplate: initialActiveTemplate, allTemplates, initialInvoice, onSave, onCancel }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialInvoice?.customerId || '');
  const [items, setItems] = useState<LineItem[]>(initialInvoice?.items || []);
  const [invoiceNumber, setInvoiceNumber] = useState(initialInvoice?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`);
  const [viewMode, setViewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [customFieldData, setCustomFieldData] = useState<Record<string, string>>(initialInvoice?.customFieldData || {});
  
  const [activeTemplate, setActiveTemplate] = useState<InvoiceTemplate>(() => {
    if (initialInvoice?.templateId) {
      return allTemplates.find(t => t.id === initialInvoice.templateId) || initialActiveTemplate;
    }
    return initialActiveTemplate;
  });

  const [showTemplatePicker, setShowTemplatePicker] = useState(!initialInvoice);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<{ 
    productId: string, 
    name: string, 
    price: number,
    dynamicValues: Record<string, string>
  } | null>(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + (item.price * item.quantity), 0), [items]);
  const taxTotal = subtotal * 0.18; 
  const grandTotal = subtotal + taxTotal;
  const editableFields = useMemo(() => activeTemplate.customFields.filter(f => f.isEditable), [activeTemplate]);
  const systemTemplates = useMemo(() => allTemplates.filter(t => t.id === 'default'), [allTemplates]);
  const customTemplates = useMemo(() => allTemplates.filter(t => t.id !== 'default'), [allTemplates]);

  const addItem = (product: Product) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      // Pre-fill static fields from inventory
      const initialDynamic: Record<string, string> = {};
      product.dynamicFields?.forEach(f => {
        if (!f.isDynamic) initialDynamic[f.label] = f.defaultValue;
      });

      setItems([...items, { 
        productId: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1, 
        taxRate: 18,
        dynamicValues: initialDynamic
      }]);
    }
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.productId !== id));

  const handleCustomAdd = () => {
    if (!customizingItem) return;
    const existing = items.find(i => i.productId === customizingItem.productId);
    if (existing) {
      setItems(items.map(i => i.productId === customizingItem.productId 
        ? { 
            ...i, 
            name: customizingItem.name, 
            price: customizingItem.price,
            dynamicValues: customizingItem.dynamicValues
          } 
        : i));
    } else {
      setItems([...items, { 
        productId: customizingItem.productId, 
        name: customizingItem.name, 
        price: customizingItem.price, 
        quantity: 1, 
        taxRate: 18,
        dynamicValues: customizingItem.dynamicValues
      }]);
    }
    setCustomizingItem(null);
  };

  const handleSave = () => {
    if (!selectedCustomerId || items.length === 0) {
      alert("Please select a customer and add items.");
      return;
    }
    const invoiceData: Invoice = {
      id: initialInvoice?.id || Math.random().toString(36).substr(2, 9),
      invoiceNumber,
      date: initialInvoice?.date || new Date().toISOString(),
      customerId: selectedCustomerId,
      items,
      subtotal,
      taxTotal,
      grandTotal,
      status: initialInvoice?.status || 'UNPAID',
      profileId: activeProfile.id,
      templateId: activeTemplate.id,
      customFieldData
    };
    onSave(invoiceData);
  };

  const handleTallyDownload = () => {
    const dummyInvoice: Invoice = {
      id: initialInvoice?.id || 'temp',
      invoiceNumber,
      date: new Date().toISOString(),
      customerId: selectedCustomerId,
      items,
      subtotal,
      taxTotal,
      grandTotal,
      status: 'UNPAID',
      profileId: activeProfile.id,
      customFieldData
    };
    downloadTallyFile(dummyInvoice, activeProfile, selectedCustomer);
  };

  // Helper to get fields for customization modal
  const getDynamicFieldsForModal = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.dynamicFields || [];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      {/* Template Picker (Existing) */}
      {showTemplatePicker && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-4xl p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button onClick={onCancel} className="absolute top-8 right-8 p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
              <X size={24} />
            </button>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-900">Choose a Template</h2>
              <p className="text-gray-500 mt-2">Pick the best format for your business sale today.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto no-scrollbar p-2">
               {systemTemplates.map(template => (
                <button key={template.id} onClick={() => { setActiveTemplate(template); setShowTemplatePicker(false); }} className="flex flex-col items-start p-6 rounded-3xl border-2 border-indigo-200 bg-indigo-50/20 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all group text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 bg-indigo-600 text-white rounded-bl-xl"><ShieldCheck size={14} /></div>
                  <div className="p-4 bg-indigo-600 text-white rounded-2xl mb-4 group-hover:scale-110 transition-transform"><Layout size={32} /></div>
                  <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1">Recommended System Template</p>
                </button>
              ))}
              {customTemplates.map(template => (
                <button key={template.id} onClick={() => { setActiveTemplate(template); setShowTemplatePicker(false); }} className="flex flex-col items-start p-6 rounded-3xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all group text-left">
                  <div className="p-4 bg-gray-50 text-indigo-600 rounded-2xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Layout size={32} /></div>
                  <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{template.baseStyle} Format</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header (Existing) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><ChevronLeft size={24} /></button>
          <div>
            <h2 className="text-2xl font-bold">{initialInvoice ? 'Edit Invoice' : 'New Sale'}</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{activeProfile.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <button onClick={() => setShowTemplateDropdown(!showTemplateDropdown)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-all shadow-sm">
              <Layout size={14} /><span>{activeTemplate.name}</span><ChevronDown size={14} className={`transition-transform duration-200 ${showTemplateDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showTemplateDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTemplateDropdown(false)} />
                <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 mb-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Template</p></div>
                  {systemTemplates.map(t => (
                    <button key={t.id} onClick={() => { setActiveTemplate(t); setShowTemplateDropdown(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 transition-all ${activeTemplate.id === t.id ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-700'}`}>
                      <div className="flex items-center space-x-3"><ShieldCheck size={14} className={activeTemplate.id === t.id ? 'text-indigo-600' : 'text-gray-400'} /> <span className="text-sm font-bold">{t.name}</span></div>
                      {activeTemplate.id === t.id && <CheckCircle size={14} />}
                    </button>
                  ))}
                  {customTemplates.length > 0 && (
                    <>
                      <div className="px-4 py-2 mt-2 mb-1 border-t border-gray-100 pt-3"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">My Designs</p></div>
                      {customTemplates.map(t => (
                        <button key={t.id} onClick={() => { setActiveTemplate(t); setShowTemplateDropdown(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 transition-all ${activeTemplate.id === t.id ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-700'}`}>
                          <div className="flex items-center space-x-3"><div className={`w-2 h-2 rounded-full ${activeTemplate.id === t.id ? 'bg-indigo-600' : 'bg-gray-200'}`} /> <span className="text-sm font-bold">{t.name}</span></div>
                          {activeTemplate.id === t.id && <CheckCircle size={14} />}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl">
            <button onClick={() => setViewMode('EDIT')} className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'EDIT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><Edit3 size={16} /><span>Details</span></button>
            <button onClick={() => setViewMode('PREVIEW')} className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'PREVIEW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><Eye size={16} /><span>Live Preview</span></button>
          </div>
        </div>
      </div>

      {viewMode === 'EDIT' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1"><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Invoice Number</label><input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"/></div>
                  <div className="col-span-2 md:col-span-1"><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Customer</label><select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"><option value="">Select Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
               </div>
               {editableFields.length > 0 && (
                 <div className="pt-4 mt-4 border-t border-gray-100">
                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-[2px] mb-4">Template Specific Details</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {editableFields.map(f => (
                         <div key={f.id}><label className="block text-xs font-bold text-gray-500 mb-1">{f.label}</label><input type="text" value={customFieldData[f.id] || ''} onChange={e => setCustomFieldData({...customFieldData, [f.id]: e.target.value})} placeholder={`Enter ${f.label.toLowerCase()}...`} className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"/></div>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 text-xs font-bold text-gray-400 uppercase grid grid-cols-12 gap-4">
                <div className="col-span-6">Item Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="divide-y divide-gray-50">
                {items.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 italic">No items added to bill yet.</div>
                ) : (
                  items.map(item => (
                    <div key={item.productId} className="p-4 grid grid-cols-12 gap-4 items-center group">
                      <div className="col-span-6 flex flex-col">
                        <div className="flex items-center space-x-3">
                          <button onClick={() => removeItem(item.productId)} className="text-red-300 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                          <span className="font-semibold text-sm">{item.name}</span>
                          <button onClick={() => setCustomizingItem({ productId: item.productId, name: item.name, price: item.price, dynamicValues: item.dynamicValues || {} })} className="text-indigo-400 hover:text-indigo-600 p-1 ml-1"><Edit2 size={12} /></button>
                        </div>
                        {item.dynamicValues && Object.entries(item.dynamicValues).length > 0 && (
                          <div className="ml-10 flex flex-wrap gap-2 mt-1">
                            {Object.entries(item.dynamicValues).map(([key, val]) => (
                              <span key={key} className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold uppercase">{key}: {val || '---'}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2"><input type="number" value={item.quantity} onChange={e => setItems(items.map(i => i.productId === item.productId ? { ...i, quantity: parseInt(e.target.value) || 0 } : i))} className="w-full text-center bg-gray-50 border-none rounded-lg p-1 text-sm font-bold"/></div>
                      <div className="col-span-2 text-right text-sm">₹{item.price}</div>
                      <div className="col-span-2 text-right text-sm font-black">₹{item.price * item.quantity}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl text-white">
              <h3 className="font-bold mb-4 opacity-80 uppercase text-xs tracking-widest">Billing Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="opacity-70">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="opacity-70">Tax (GST 18%)</span><span>₹{taxTotal.toFixed(2)}</span></div>
                <div className="pt-3 border-t border-white/20 flex justify-between font-black text-2xl"><span>TOTAL</span><span>₹{grandTotal.toFixed(2)}</span></div>
              </div>
              <button onClick={handleSave} className="w-full mt-8 bg-white text-indigo-600 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-indigo-50 transition-all active:scale-95">{initialInvoice ? 'UPDATE INVOICE' : 'SAVE & PRINT'}</button>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-4">Quick Add</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                {products.map(p => (
                  <div key={p.id} className="group relative">
                    <button onClick={() => addItem(p)} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-all text-left pr-20">
                      <div><p className="font-semibold text-sm">{p.name}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">₹{p.price}</p></div>
                      <Plus size={16} className="text-indigo-400" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setCustomizingItem({ productId: p.id, name: p.name, price: p.price, dynamicValues: {} }); }} className="absolute right-10 top-1/2 -translate-y-1/2 p-2 bg-white text-indigo-600 rounded-lg shadow-sm border border-indigo-50 transition-all active:scale-90"><Edit2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in zoom-in-95 duration-300">
          <div className="bg-white border border-gray-300 shadow-2xl p-8 md:p-12 max-w-4xl mx-auto rounded-lg font-mono text-xs text-gray-900 leading-tight">
             <div className="border-b-2 border-gray-900 pb-6 mb-6 flex justify-between items-start">
                <div>
                   <h1 className="text-3xl font-black uppercase mb-1" style={{ color: activeTemplate.accentColor }}>{activeProfile.name}</h1>
                   <p className="whitespace-pre-line">{activeProfile.address}</p>
                   {activeTemplate.customFields.filter(f => f.position === 'HEADER').map(f => (
                     <p key={f.id} className="mt-1 font-bold">{f.label}: <span className="text-gray-600">{f.isEditable ? (customFieldData[f.id] || '---') : f.defaultValue}</span></p>
                   ))}
                   <p className="mt-2 font-bold">GSTIN: {activeProfile.gstin}</p>
                   <p>Ph: {activeProfile.phone} | {activeProfile.email}</p>
                </div>
                <div className="text-right">
                   <div className="bg-gray-900 text-white px-4 py-1 font-black text-lg mb-4 inline-block">TAX INVOICE</div>
                   <p className="font-bold">Invoice No: <span className="text-gray-600">{invoiceNumber}</span></p>
                   <p className="font-bold">Date: <span className="text-gray-600">{new Date().toLocaleDateString()}</span></p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8 mb-4">
                <div className="border border-gray-300 p-4 rounded bg-gray-50">
                   <p className="font-black border-b border-gray-200 pb-2 mb-2 uppercase text-[10px] tracking-widest text-gray-500">Bill To:</p>
                   {selectedCustomer ? (
                     <>
                        <p className="text-lg font-black">{selectedCustomer.name}</p>
                        <p className="mt-1">{selectedCustomer.address}</p>
                        <p className="mt-1">Ph: {selectedCustomer.phone}</p>
                     </>
                   ) : <p className="italic text-red-500">No customer selected</p>}
                </div>
                <div className="border border-gray-300 p-4 rounded bg-gray-50">
                   <p className="font-black border-b border-gray-200 pb-2 mb-2 uppercase text-[10px] tracking-widest text-gray-500">Ship To:</p>
                   <p className="text-gray-400 italic">Same as billing address</p>
                </div>
             </div>

             {/* FIXED: ABOVE_ITEMS rendering */}
             <div className="mb-4 space-y-1">
                {activeTemplate.customFields.filter(f => f.position === 'ABOVE_ITEMS').map(f => (
                  <p key={f.id} className="text-[10px]"><span className="font-bold">{f.label}:</span> <span className="text-gray-600">{f.isEditable ? (customFieldData[f.id] || '---') : f.defaultValue}</span></p>
                ))}
             </div>

             <table className="w-full border-collapse border border-gray-900 mb-8">
                <thead>
                   <tr className="bg-gray-100">
                      <th className="border border-gray-900 p-2 text-left">SL</th>
                      <th className="border border-gray-900 p-2 text-left w-1/2">DESCRIPTION OF GOODS</th>
                      <th className="border border-gray-900 p-2 text-center">HSN</th>
                      <th className="border border-gray-900 p-2 text-center">QTY</th>
                      <th className="border border-gray-900 p-2 text-right">RATE</th>
                      <th className="border border-gray-900 p-2 text-right">AMOUNT</th>
                   </tr>
                </thead>
                <tbody>
                   {items.map((item, idx) => (
                      <tr key={idx} className="h-10 align-top">
                         <td className="border border-gray-900 p-2 text-center">{idx + 1}</td>
                         <td className="border border-gray-900 p-2">
                            <p className="font-bold">{item.name}</p>
                            {item.dynamicValues && Object.entries(item.dynamicValues).length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {Object.entries(item.dynamicValues).map(([k, v]) => (
                                  <p key={k} className="text-[8px] text-gray-500 uppercase font-black">{k}: {v}</p>
                                ))}
                              </div>
                            )}
                         </td>
                         <td className="border border-gray-900 p-2 text-center">00000</td>
                         <td className="border border-gray-900 p-2 text-center font-bold">{item.quantity}</td>
                         <td className="border border-gray-900 p-2 text-right">{item.price.toFixed(2)}</td>
                         <td className="border border-gray-900 p-2 text-right font-bold">{ (item.price * item.quantity).toFixed(2) }</td>
                      </tr>
                   ))}
                </tbody>
                <tfoot>
                   <tr className="font-black bg-gray-50">
                      <td colSpan={5} className="border border-gray-900 p-2 text-right">Subtotal</td>
                      <td className="border border-gray-900 p-2 text-right">₹{subtotal.toFixed(2)}</td>
                   </tr>
                   <tr className="font-black bg-gray-900 text-white text-lg">
                      <td colSpan={5} className="border border-gray-900 p-3 text-right">GRAND TOTAL</td>
                      <td className="border border-gray-900 p-3 text-right">₹{grandTotal.toFixed(2)}</td>
                   </tr>
                </tfoot>
             </table>

             <div className="mb-4 space-y-1">
                {activeTemplate.customFields.filter(f => f.position === 'BELOW_ITEMS').map(f => (
                  <p key={f.id} className="text-[10px]"><span className="font-bold">{f.label}:</span> <span className="text-gray-600">{f.isEditable ? (customFieldData[f.id] || '---') : f.defaultValue}</span></p>
                ))}
             </div>

             <div className="space-y-1 mb-8">
                {activeTemplate.customFields.filter(f => f.position === 'FOOTER').map(f => (
                  <p key={f.id} className="text-[10px]"><span className="font-bold">{f.label}:</span> {f.isEditable ? (customFieldData[f.id] || '---') : f.defaultValue}</p>
                ))}
             </div>

             <div className="flex justify-between items-end">
                <div className="text-[10px] text-gray-500 italic max-w-sm">
                   <p className="font-bold mb-1">Declaration:</p>
                   <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
                </div>
                <div className="text-center border-t border-gray-900 pt-4 w-64">
                   <p className="font-black mb-12">For {activeProfile.name}</p>
                   <p className="text-[10px] font-bold uppercase">Authorised Signatory</p>
                </div>
             </div>
          </div>
          <div className="flex justify-center space-x-4 mt-8 no-print">
             <button onClick={handleTallyDownload} className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg"><FileCode size={20} /><span>Tally XML</span></button>
             <button onClick={() => window.print()} className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg"><Printer size={20} /><span>Print Bill</span></button>
          </div>
        </div>
      )}

      {customizingItem && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-6">Customize Item</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-400 mb-1">Display Name</label><input type="text" value={customizingItem.name} onChange={e => setCustomizingItem({ ...customizingItem, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"/></div>
              <div><label className="block text-xs font-bold text-gray-400 mb-1">Price (₹)</label><input type="number" value={customizingItem.price} onChange={e => setCustomizingItem({ ...customizingItem, price: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"/></div>
              
              {/* Product-Specific Dynamic Fields */}
              {getDynamicFieldsForModal(customizingItem.productId).filter(f => f.isDynamic).map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-bold text-indigo-600 mb-1">{f.label}</label>
                  <input 
                    type="text" 
                    value={customizingItem.dynamicValues[f.label] || ''} 
                    onChange={e => setCustomizingItem({ 
                      ...customizingItem, 
                      dynamicValues: { ...customizingItem.dynamicValues, [f.label]: e.target.value } 
                    })} 
                    placeholder={`Enter ${f.label}...`}
                    className="w-full bg-indigo-50/50 border-2 border-indigo-100 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button onClick={() => setCustomizingItem(null)} className="px-6 py-2 text-gray-400 font-bold">Cancel</button>
              <button onClick={handleCustomAdd} className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm;
