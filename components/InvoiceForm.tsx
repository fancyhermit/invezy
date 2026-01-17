
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, Customer, Invoice, LineItem, BusinessProfile, InvoiceTemplate, PaperFormat } from '../types';
import { Trash2, Plus, ChevronLeft, Eye, Edit3, Download, Share2, Printer, FileCode, Edit2, ChevronDown, Layout, CheckCircle, X, ShieldCheck, Maximize2 } from 'lucide-react';
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
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  const [activeTemplate, setActiveTemplate] = useState<InvoiceTemplate>(() => {
    if (initialInvoice?.templateId) {
      return allTemplates.find(t => t.id === initialInvoice.templateId) || initialActiveTemplate;
    }
    return { ...initialActiveTemplate, paperFormat: initialActiveTemplate.paperFormat || 'A4' };
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

  // Fix: Added missing getDynamicFieldsForModal helper function to retrieve dynamic fields for a given product
  const getDynamicFieldsForModal = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.dynamicFields || [];
  };

  useEffect(() => {
    const handleResize = () => {
      if (viewMode === 'PREVIEW' && previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth - 32;
        const sheetWidth = activeTemplate.paperFormat === 'A5' ? 560 : 800;
        if (containerWidth < sheetWidth) {
          setPreviewScale(containerWidth / sheetWidth);
        } else {
          setPreviewScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode, activeTemplate.paperFormat]);

  const addItem = (product: Product) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
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
        ? { ...i, name: customizingItem.name, price: customizingItem.price, dynamicValues: customizingItem.dynamicValues } 
        : i));
    } else {
      setItems([...items, { 
        productId: customizingItem.productId, name: customizingItem.name, price: customizingItem.price, quantity: 1, taxRate: 18, dynamicValues: customizingItem.dynamicValues
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
      id: initialInvoice?.id || 'temp', invoiceNumber, date: new Date().toISOString(), customerId: selectedCustomerId, items, subtotal, taxTotal, grandTotal, status: 'UNPAID', profileId: activeProfile.id, customFieldData
    };
    downloadTallyFile(dummyInvoice, activeProfile, selectedCustomer);
  };

  const formatStyles: Record<PaperFormat, string> = {
    'A4': 'min-h-[1123px] w-[800px]',
    'A5': 'min-h-[794px] w-[560px]',
    'LEGAL': 'min-h-[1344px] w-[800px]'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative pb-20">
      {/* Template Picker */}
      {showTemplatePicker && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-4xl p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button onClick={onCancel} className="absolute top-8 right-8 p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
              <X size={24} />
            </button>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-900">Choose a Identity</h2>
              <p className="text-gray-500 mt-2 font-medium">Which business format should we use for this sale?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto no-scrollbar p-2">
               {systemTemplates.map(template => (
                <button key={template.id} onClick={() => { setActiveTemplate({...template, paperFormat: 'A4'}); setShowTemplatePicker(false); }} className="flex flex-col items-start p-8 rounded-3xl border-2 border-indigo-200 bg-indigo-50/20 hover:border-indigo-600 hover:bg-white transition-all group text-left relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 p-3 bg-indigo-600 text-white rounded-bl-xl"><ShieldCheck size={16} /></div>
                  <div className="p-4 bg-indigo-600 text-white rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-100"><Layout size={32} /></div>
                  <h3 className="text-lg font-black text-gray-900">{template.name}</h3>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-2">Recommended Standard</p>
                </button>
              ))}
              {customTemplates.map(template => (
                <button key={template.id} onClick={() => { setActiveTemplate(template); setShowTemplatePicker(false); }} className="flex flex-col items-start p-8 rounded-3xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-white transition-all group text-left shadow-sm">
                  <div className="p-4 bg-gray-50 text-indigo-600 rounded-2xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Layout size={32} /></div>
                  <h3 className="text-lg font-black text-gray-900">{template.name}</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">{template.paperFormat || 'A4'} Size • {template.baseStyle}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-30 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><ChevronLeft size={24} /></button>
          <div>
            <h2 className="text-2xl font-black text-gray-900">{initialInvoice ? 'Edit Bill' : 'New Invoice'}</h2>
            <p className="text-xs text-indigo-500 font-black uppercase tracking-widest">Profiling: {activeProfile.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-2">
          {/* Format Selector */}
          <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            {(['A4', 'A5', 'LEGAL'] as PaperFormat[]).map(f => (
              <button 
                key={f}
                onClick={() => setActiveTemplate({...activeTemplate, paperFormat: f})}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeTemplate.paperFormat === f ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative">
            <button onClick={() => setShowTemplateDropdown(!showTemplateDropdown)} className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-700 hover:border-indigo-200 transition-all shadow-sm">
              <Layout size={14} className="text-indigo-600" /><span>{activeTemplate.name}</span><ChevronDown size={14} className={`transition-transform duration-200 ${showTemplateDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showTemplateDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTemplateDropdown(false)} />
                <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-5 py-2 mb-1"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Choose Layout</p></div>
                  {allTemplates.map(t => (
                    <button key={t.id} onClick={() => { setActiveTemplate({...t, paperFormat: activeTemplate.paperFormat}); setShowTemplateDropdown(false); }} className={`w-full flex items-center justify-between px-5 py-3 transition-all ${activeTemplate.id === t.id ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-700'}`}>
                      <div className="flex items-center space-x-3"><div className={`w-2 h-2 rounded-full ${activeTemplate.id === t.id ? 'bg-indigo-600' : 'bg-gray-200'}`} /> <span className="text-sm font-bold">{t.name}</span></div>
                      {activeTemplate.id === t.id && <CheckCircle size={14} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setViewMode('EDIT')} className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'EDIT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}><Edit3 size={16} /><span>Edit</span></button>
            <button onClick={() => setViewMode('PREVIEW')} className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'PREVIEW' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}><Eye size={16} /><span>Preview</span></button>
          </div>
        </div>
      </div>

      {viewMode === 'EDIT' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Invoice Number</label><input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"/></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select Customer</label><select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"><option value="">Search customer...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
               </div>
               {editableFields.length > 0 && (
                 <div className="pt-6 mt-6 border-t border-gray-100">
                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Additional Info</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {editableFields.map(f => (
                         <div key={f.id}><label className="block text-[10px] font-black text-gray-500 uppercase mb-2">{f.label}</label><input type="text" value={customFieldData[f.id] || ''} onChange={e => setCustomFieldData({...customFieldData, [f.id]: e.target.value})} placeholder={`e.g. ${f.label}`} className="w-full bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"/></div>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest grid grid-cols-12 gap-4">
                <div className="col-span-6">Item Details</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="divide-y divide-gray-50 min-h-[300px]">
                {items.length === 0 ? (
                  <div className="p-20 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">Start adding products from inventory</div>
                ) : (
                  items.map(item => (
                    <div key={item.productId} className="p-6 grid grid-cols-12 gap-4 items-center group hover:bg-indigo-50/10 transition-colors">
                      <div className="col-span-6">
                        <div className="flex items-center space-x-4">
                          <button onClick={() => removeItem(item.productId)} className="text-red-200 hover:text-red-500 p-2 bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                          <div>
                            <span className="font-black text-gray-900 text-sm block">{item.name}</span>
                            <button onClick={() => setCustomizingItem({ productId: item.productId, name: item.name, price: item.price, dynamicValues: item.dynamicValues || {} })} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 hover:underline flex items-center space-x-1"><Edit2 size={10} /><span>Customize Details</span></button>
                          </div>
                        </div>
                        {item.dynamicValues && Object.entries(item.dynamicValues).length > 0 && (
                          <div className="ml-14 flex flex-wrap gap-2 mt-2">
                            {Object.entries(item.dynamicValues).map(([key, val]) => (
                              <span key={key} className="text-[8px] bg-white border border-gray-200 px-2 py-0.5 rounded-lg text-gray-500 font-black uppercase">{key}: {val || '--'}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2"><input type="number" value={item.quantity} onChange={e => setItems(items.map(i => i.productId === item.productId ? { ...i, quantity: parseInt(e.target.value) || 0 } : i))} className="w-full text-center bg-gray-50 border-none rounded-xl p-3 text-sm font-black"/></div>
                      <div className="col-span-2 text-right text-sm font-bold text-gray-500">₹{item.price.toLocaleString()}</div>
                      <div className="col-span-2 text-right text-sm font-black text-indigo-600">₹{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[40px] shadow-2xl shadow-indigo-200 text-white">
              <h3 className="font-black mb-6 opacity-60 uppercase text-[10px] tracking-[3px]">Financials</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold"><span className="opacity-60">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm font-bold"><span className="opacity-60">GST (18%)</span><span>₹{taxTotal.toLocaleString()}</span></div>
                <div className="pt-6 border-t border-white/20 flex justify-between font-black text-3xl"><span>TOTAL</span><span>₹{grandTotal.toLocaleString()}</span></div>
              </div>
              <button onClick={handleSave} className="w-full mt-10 bg-white text-indigo-600 py-5 rounded-[24px] font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">GENERATE & PRINT</button>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <h3 className="font-black text-gray-900 mb-6 uppercase text-[10px] tracking-widest">Available Stock</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
                {products.map(p => (
                  <div key={p.id} className="group relative">
                    <button onClick={() => addItem(p)} className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all text-left border border-transparent hover:border-indigo-100">
                      <div><p className="font-black text-sm text-gray-900">{p.name}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">₹{p.price.toLocaleString()}</p></div>
                      <Plus size={18} className="text-indigo-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PREVIEW MODE WITH SMART SCALING */
        <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center">
          <div className="mb-6 flex space-x-4 no-print">
             <button onClick={handleTallyDownload} className="flex items-center space-x-3 bg-white border-2 border-green-100 text-green-600 px-8 py-4 rounded-[24px] font-black shadow-lg hover:bg-green-50 transition-all"><FileCode size={20} /><span>TALLY XML</span></button>
             <button onClick={() => window.print()} className="flex items-center space-x-3 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"><Printer size={20} /><span>PRINT INVOICE</span></button>
          </div>

          <div className="w-full flex justify-center overflow-visible" ref={previewContainerRef}>
            <div 
               className={`bg-white shadow-2xl origin-top transition-transform duration-300 ${formatStyles[activeTemplate.paperFormat]} ${activeTemplate.baseStyle === 'TALLY' ? 'font-mono' : 'font-sans'} text-gray-900`}
               style={{ 
                  transform: `scale(${previewScale})`,
                  padding: activeTemplate.paperFormat === 'A5' ? '1.5rem' : '3.5rem',
                  fontSize: activeTemplate.paperFormat === 'A5' ? '11px' : '10px'
               }}
            >
               {/* Invoice Content Start */}
               <div className={`border-b-2 border-gray-900 pb-8 mb-8 flex justify-between items-start`}>
                  <div className="flex-1">
                     <h1 className="text-4xl font-black uppercase mb-2" style={{ color: activeTemplate.accentColor }}>{activeProfile.name}</h1>
                     <p className="whitespace-pre-line text-xs font-medium leading-relaxed max-w-sm">{activeProfile.address}</p>
                     <div className="mt-6 space-y-1">
                        {activeTemplate.customFields.filter(f => f.position === 'HEADER').map(f => (
                          <p key={f.id} className="font-black uppercase tracking-widest text-[9px]">{f.label}: <span className="text-gray-600">{f.isEditable ? (customFieldData[f.id] || '---') : f.defaultValue}</span></p>
                        ))}
                     </div>
                     <p className="mt-4 font-black">GSTIN: {activeProfile.gstin}</p>
                     <p className="font-bold">Contact: {activeProfile.phone} | {activeProfile.email}</p>
                  </div>
                  <div className="text-right">
                     <div className="bg-gray-900 text-white px-8 py-2 font-black text-xl mb-6 inline-block uppercase tracking-[4px]">TAX INVOICE</div>
                     <p className="font-black text-lg">INV #: <span className="text-gray-500">{invoiceNumber}</span></p>
                     <p className="font-bold uppercase tracking-widest text-[10px] text-gray-400">Date: {new Date().toLocaleDateString()}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-10 mb-8">
                  <div className="border-2 border-gray-100 p-6 rounded-[24px] bg-gray-50/50">
                     <p className="font-black uppercase text-[10px] tracking-widest text-indigo-400 mb-4 border-b border-indigo-50 pb-2">Billed To:</p>
                     {selectedCustomer ? (
                       <>
                          <p className="text-xl font-black text-gray-900">{selectedCustomer.name}</p>
                          <p className="mt-2 font-medium leading-relaxed">{selectedCustomer.address}</p>
                          <p className="mt-4 font-black text-gray-400 uppercase tracking-widest text-[9px]">Mob: {selectedCustomer.phone}</p>
                       </>
                     ) : <p className="italic text-red-500 font-bold">MISSING CUSTOMER DATA</p>}
                  </div>
                  <div className="border-2 border-gray-100 p-6 rounded-[24px] bg-gray-50/50">
                     <p className="font-black uppercase text-[10px] tracking-widest text-indigo-400 mb-4 border-b border-indigo-50 pb-2">Shipping Information:</p>
                     <p className="text-gray-400 font-bold italic text-xs uppercase tracking-widest">As per billing address</p>
                  </div>
               </div>

               {/* ABOVE_ITEMS rendering */}
               <div className="mb-6 space-y-2 border-l-4 border-indigo-100 pl-6 py-1">
                  {activeTemplate.customFields.filter(f => f.position === 'ABOVE_ITEMS').map(f => (
                    <p key={f.id} className="text-xs"><span className="font-black uppercase tracking-widest text-[10px] text-indigo-400">{f.label}:</span> <span className="font-bold">{f.isEditable ? (customFieldData[f.id] || '---') : f.defaultValue}</span></p>
                  ))}
               </div>

               <table className="w-full border-collapse mb-10 overflow-hidden rounded-xl border border-gray-900">
                  <thead className="bg-gray-100">
                     <tr>
                        <th className="border border-gray-900 p-4 text-left font-black text-[9px] uppercase tracking-widest">SL</th>
                        <th className="border border-gray-900 p-4 text-left font-black text-[9px] uppercase tracking-widest w-1/2">DESCRIPTION OF GOODS</th>
                        <th className="border border-gray-900 p-4 text-center font-black text-[9px] uppercase tracking-widest">HSN</th>
                        <th className="border border-gray-900 p-4 text-center font-black text-[9px] uppercase tracking-widest">QTY</th>
                        <th className="border border-gray-900 p-4 text-right font-black text-[9px] uppercase tracking-widest">RATE</th>
                        <th className="border border-gray-900 p-4 text-right font-black text-[9px] uppercase tracking-widest">TOTAL</th>
                     </tr>
                  </thead>
                  <tbody>
                     {items.map((item, idx) => (
                        <tr key={idx} className="h-12 align-top group hover:bg-gray-50">
                           <td className="border border-gray-900 p-4 text-center font-bold text-gray-400">{idx + 1}</td>
                           <td className="border border-gray-900 p-4">
                              <p className="font-black text-gray-900 uppercase tracking-tighter text-sm">{item.name}</p>
                              {item.dynamicValues && Object.entries(item.dynamicValues).length > 0 && (
                                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                  {Object.entries(item.dynamicValues).map(([k, v]) => (
                                    <p key={k} className="text-[9px] text-gray-400 uppercase font-black"><span className="text-indigo-400">{k}:</span> {v}</p>
                                  ))}
                                </div>
                              )}
                           </td>
                           <td className="border border-gray-900 p-4 text-center font-bold text-gray-400">0000</td>
                           <td className="border border-gray-900 p-4 text-center font-black text-sm">{item.quantity}</td>
                           <td className="border border-gray-900 p-4 text-right font-bold">{item.price.toFixed(2)}</td>
                           <td className="border border-gray-900 p-4 text-right font-black text-sm">{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                     ))}
                  </tbody>
                  <tfoot>
                     <tr className="bg-gray-50">
                        <td colSpan={5} className="border border-gray-900 p-4 text-right font-black uppercase text-[10px] tracking-widest">Net Subtotal</td>
                        <td className="border border-gray-900 p-4 text-right font-black text-base">₹{subtotal.toFixed(2)}</td>
                     </tr>
                     <tr className="bg-gray-900 text-white">
                        <td colSpan={5} className="border border-gray-900 p-5 text-right font-black uppercase text-xs tracking-[4px]">GRAND TOTAL</td>
                        <td className="border border-gray-900 p-5 text-right font-black text-xl">₹{grandTotal.toFixed(2)}</td>
                     </tr>
                  </tfoot>
               </table>

               <div className="mb-10 space-y-4">
                  {activeTemplate.customFields.filter(f => f.position === 'BELOW_ITEMS').map(f => (
                    <div key={f.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center space-x-4">
                      <span className="font-black text-[9px] uppercase tracking-widest text-gray-400 w-32 shrink-0">{f.label}</span>
                      <span className="font-black text-gray-900">{f.isEditable ? (customFieldData[f.id] || '---') : f.defaultValue}</span>
                    </div>
                  ))}
               </div>

               <div className="space-y-2 mb-10">
                  {activeTemplate.customFields.filter(f => f.position === 'FOOTER').map(f => (
                    <p key={f.id} className="text-xs font-bold text-gray-600"><span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{f.label}:</span> {f.isEditable ? (customFieldData[f.id] || '---') : f.defaultValue}</p>
                  ))}
               </div>

               <div className="flex justify-between items-end pt-10 border-t border-gray-200">
                  <div className="text-[10px] text-gray-400 font-bold max-w-sm leading-relaxed">
                     <p className="font-black uppercase tracking-widest mb-2 text-gray-900">Official Declaration:</p>
                     <p>All items listed are certified as described. This is a computer-generated tax document and requires a digital or physical authorized signature.</p>
                  </div>
                  <div className="text-center w-72">
                     <p className="font-black text-lg mb-16">For {activeProfile.name}</p>
                     <div className="border-t-2 border-gray-900 pt-3">
                        <p className="text-[10px] font-black uppercase tracking-[3px]">Authorized Signatory</p>
                     </div>
                  </div>
               </div>
               {/* Invoice Content End */}
            </div>
          </div>
        </div>
      )}

      {/* Item Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-gray-900 mb-8">Customize Line Item</h3>
            <div className="space-y-6">
              <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Name</label><input type="text" value={customizingItem.name} onChange={e => setCustomizingItem({ ...customizingItem, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"/></div>
              <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rate (₹)</label><input type="number" value={customizingItem.price} onChange={e => setCustomizingItem({ ...customizingItem, price: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-black text-lg text-indigo-600"/></div>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Tracking Attributes</p>
                <div className="space-y-4">
                  {getDynamicFieldsForModal(customizingItem.productId).filter(f => f.isDynamic).map(f => (
                    <div key={f.label}>
                      <label className="block text-[9px] font-black text-gray-500 uppercase mb-2">{f.label}</label>
                      <input 
                        type="text" 
                        value={customizingItem.dynamicValues[f.label] || ''} 
                        onChange={e => setCustomizingItem({ 
                          ...customizingItem, 
                          dynamicValues: { ...customizingItem.dynamicValues, [f.label]: e.target.value } 
                        })} 
                        placeholder={`Enter ${f.label.toLowerCase()}...`}
                        className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-10">
              <button onClick={() => setCustomizingItem(null)} className="px-6 py-2 text-gray-400 font-bold hover:text-gray-600 transition-colors">Cancel</button>
              <button onClick={handleCustomAdd} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:scale-105 transition-all">Apply Details</button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .fixed, .sticky, header, aside, .lg\\:col-span-1, .lg\\:col-span-3 { display: none !important; }
          
          .animate-in { 
             visibility: visible; 
             position: absolute; 
             left: 0; 
             top: 0; 
             width: 100% !important; 
             padding: 0 !important;
             margin: 0 !important;
          }
          
          .animate-in > div:last-child { 
             visibility: visible; 
             position: absolute; 
             left: 0; 
             top: 0; 
             width: 100% !important;
             display: flex !important;
             justify-content: center !important;
          }

          .origin-top { 
             visibility: visible;
             transform: scale(1) !important;
             box-shadow: none !important;
             border: none !important;
             width: 100% !important;
          }

          @page {
            size: ${activeTemplate.paperFormat === 'LEGAL' ? 'legal' : activeTemplate.paperFormat === 'A5' ? 'A5' : 'A4'};
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceForm;
