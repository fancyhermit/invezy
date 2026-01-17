
import React, { useState, useRef, useEffect } from 'react';
import { InvoiceTemplate, CustomField, PaperFormat } from '../types';
import { Layout, Palette, Plus, Save, Trash2, Wand2, Type as TypeIcon, Edit, Lock, ChevronDown, CheckCircle, ShieldAlert, FileText, Maximize2 } from 'lucide-react';

interface Props {
  templates: InvoiceTemplate[];
  onUpdate: (templates: InvoiceTemplate[]) => void;
}

const TemplateDesigner: React.FC<Props> = ({ templates, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localTemplate, setLocalTemplate] = useState<InvoiceTemplate | null>(null);
  const [scale, setScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const startNew = () => {
    const fresh: InvoiceTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Custom Template',
      baseStyle: 'TALLY',
      paperFormat: 'A4',
      accentColor: '#4f46e5',
      customFields: [],
      isDefault: false
    };
    setEditingId(fresh.id);
    setLocalTemplate(fresh);
  };

  const handleEdit = (t: InvoiceTemplate) => {
    if (t.id === 'default') return;
    setEditingId(t.id);
    setLocalTemplate({ ...t, paperFormat: t.paperFormat || 'A4' });
  };

  const handleSave = () => {
    if (!localTemplate) return;
    const exists = templates.find(t => t.id === localTemplate.id);
    let updated;
    if (exists) {
      updated = templates.map(t => t.id === localTemplate.id ? localTemplate : t);
    } else {
      updated = [...templates, localTemplate];
    }
    onUpdate(updated);
    setEditingId(null);
  };

  useEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth - 64;
        const sheetWidth = 800; // Target width of the invoice sheet
        if (containerWidth < sheetWidth) {
          setScale(containerWidth / sheetWidth);
        } else {
          setScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [editingId]);

  const addField = (pos: CustomField['position']) => {
    if (!localTemplate) return;
    const newField: CustomField = {
      id: Math.random().toString(36).substr(2, 5),
      label: 'New Detail',
      defaultValue: '',
      isEditable: true,
      position: pos
    };
    setLocalTemplate({ ...localTemplate, customFields: [...localTemplate.customFields, newField] });
  };

  const setAsDefault = (id: string) => {
    onUpdate(templates.map(t => ({ ...t, isDefault: t.id === id })));
  };

  if (editingId && localTemplate) {
    const isModern = localTemplate.baseStyle === 'MODERN';
    const isMinimal = localTemplate.baseStyle === 'MINIMAL';
    const isTally = localTemplate.baseStyle === 'TALLY';

    // Dimensions based on formats
    const formatStyles: Record<PaperFormat, string> = {
      'A4': 'min-h-[1123px] w-[800px]',
      'A5': 'min-h-[794px] w-[560px]',
      'LEGAL': 'min-h-[1344px] w-[800px]'
    };

    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-20">
        <div className="flex items-center justify-between sticky top-0 bg-gray-50/80 backdrop-blur-md z-30 py-4 -mx-4 px-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 font-bold px-3 py-1 bg-white rounded-lg shadow-sm border border-gray-100">Back</button>
            <h2 className="text-2xl font-black text-gray-900">Design Canvas</h2>
          </div>
          <button onClick={handleSave} className="flex items-center space-x-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
            <Save size={20} />
            <span>Save Design</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6 sticky lg:top-24">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Format & Layout</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['A4', 'A5', 'LEGAL'] as PaperFormat[]).map(f => (
                    <button 
                      key={f} 
                      onClick={() => setLocalTemplate({...localTemplate, paperFormat: f})}
                      className={`py-3 rounded-xl text-[10px] font-black transition-all border-2 ${localTemplate.paperFormat === f ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-50 text-gray-400 hover:border-gray-200 bg-gray-50/50'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Visual Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {['TALLY', 'MODERN', 'MINIMAL'].map((s: any) => (
                    <button 
                      key={s} 
                      onClick={() => setLocalTemplate({...localTemplate, baseStyle: s})}
                      className={`py-4 rounded-xl text-[9px] font-black transition-all border-2 flex flex-col items-center justify-center space-y-2 ${localTemplate.baseStyle === s ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-gray-50 text-gray-400 hover:bg-white'}`}
                    >
                      <Layout size={18} />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Brand Accent</label>
                <div className="flex flex-wrap gap-3">
                  {['#4f46e5', '#db2777', '#059669', '#000000', '#f59e0b', '#3b82f6'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setLocalTemplate({...localTemplate, accentColor: c})}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${localTemplate.accentColor === c ? 'border-gray-200 scale-110 shadow-lg' : 'border-transparent shadow-sm'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
              <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest flex items-center space-x-2">
                <Plus size={18} className="text-indigo-600" />
                <span>Components</span>
              </h4>
              <div className="space-y-2">
                {[
                  { id: 'HEADER', label: 'Header Block' },
                  { id: 'ABOVE_ITEMS', label: 'Above Product Grid' },
                  { id: 'BELOW_ITEMS', label: 'Below Product Grid' },
                  { id: 'FOOTER', label: 'Bottom Footer' }
                ].map((pos) => (
                  <button 
                    key={pos.id}
                    onClick={() => addField(pos.id as any)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-indigo-50 rounded-2xl text-left transition-all group"
                  >
                    <span className="text-xs font-bold text-gray-600 group-hover:text-indigo-600">{pos.label}</span>
                    <Plus size={16} className="text-indigo-300 group-hover:scale-125 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Designer Preview - SMART SCALING ENGINE */}
          <div className="lg:col-span-8 flex flex-col items-center" ref={previewContainerRef}>
            <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-[4px] flex items-center space-x-2 bg-white px-6 py-2 rounded-full border border-gray-100 shadow-sm">
              <Maximize2 size={12} />
              <span>Real-time Sheet Rendering</span>
            </div>
            
            <div className="overflow-visible" style={{ width: localTemplate.paperFormat === 'A5' ? 560 : 800 }}>
              <div 
                className={`bg-white shadow-2xl transition-all duration-500 origin-top ${formatStyles[localTemplate.paperFormat]} ${isTally ? 'font-mono' : 'font-sans'} text-gray-900 relative`}
                style={{ 
                  transform: `scale(${scale})`,
                  padding: localTemplate.paperFormat === 'A5' ? '1rem' : '2.5rem',
                  fontSize: localTemplate.paperFormat === 'A5' ? '12px' : '10px'
                }}
              >
                {/* 1. Header Area */}
                <div className={`flex justify-between items-start mb-8 ${isMinimal ? 'border-b pb-6' : isTally ? 'border-b-2 border-gray-900 pb-4' : 'bg-gray-50 -m-10 p-10 mb-8 rounded-t-sm border-b border-gray-100'}`}>
                    <div className="space-y-1 flex-1">
                       <h1 className="text-3xl font-black uppercase mb-2" style={{ color: localTemplate.accentColor }}>BRAND NAME</h1>
                       <p className="opacity-60 text-xs">123 Street, Business Hub, City</p>
                       <p className="opacity-60 text-xs font-bold">GSTIN: 27AAAAA0000A1Z5</p>
                       
                       <div className="space-y-2 mt-6">
                         {localTemplate.customFields.filter(f => f.position === 'HEADER').map(f => (
                           <FieldEditor 
                             key={f.id} 
                             field={f} 
                             onUpdate={(updated) => setLocalTemplate({...localTemplate, customFields: localTemplate.customFields.map(cf => cf.id === f.id ? updated : cf)})}
                             onRemove={() => setLocalTemplate({...localTemplate, customFields: localTemplate.customFields.filter(cf => cf.id !== f.id)})}
                           />
                         ))}
                       </div>
                    </div>
                    <div className="text-right">
                       <div className={`${isTally ? 'bg-gray-900 text-white' : 'bg-indigo-600 text-white'} px-6 py-2 inline-block mb-4 font-black text-sm uppercase tracking-widest`}>TAX INVOICE</div>
                       <p className="font-black text-lg">INV-2024-001</p>
                       <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* 2. Billing Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className={`${isTally ? 'border border-gray-200 p-4 bg-gray-50/50' : isMinimal ? 'pb-4 border-b' : ''}`}>
                       <p className="font-black text-[9px] uppercase tracking-widest text-indigo-400 mb-3">Customer Info</p>
                       <p className="text-base font-black">Client Business Ltd</p>
                       <p className="text-gray-500 mt-1 leading-relaxed">Office 402, Skyline Towers, Mumbai</p>
                    </div>
                    <div className={`${isTally ? 'border border-gray-200 p-4 bg-gray-50/50' : isMinimal ? 'pb-4 border-b' : ''}`}>
                       <p className="font-black text-[9px] uppercase tracking-widest text-indigo-400 mb-3">Shipment To</p>
                       <p className="text-gray-400 italic">Self pickup from warehouse</p>
                    </div>
                </div>

                {/* 3. ABOVE_ITEMS Custom Fields */}
                <div className="space-y-2 mb-6 border-l-4 border-indigo-100 pl-4 py-1">
                    {localTemplate.customFields.filter(f => f.position === 'ABOVE_ITEMS').map(f => (
                      <FieldEditor 
                        key={f.id} 
                        field={f} 
                        onUpdate={(updated) => setLocalTemplate({...localTemplate, customFields: localTemplate.customFields.map(cf => cf.id === f.id ? updated : cf)})}
                        onRemove={() => setLocalTemplate({...localTemplate, customFields: localTemplate.customFields.filter(cf => cf.id !== f.id)})}
                      />
                    ))}
                </div>

                {/* 4. The Grid */}
                <div className={`w-full overflow-hidden mb-6 ${isTally ? 'border-2 border-gray-900' : isMinimal ? 'border-y-2 border-gray-100 py-6' : 'rounded-2xl border border-gray-100'}`}>
                    <div className={`flex font-black p-4 text-[9px] uppercase tracking-widest ${isTally ? 'bg-gray-100 border-b-2 border-gray-900' : isModern ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400'}`}>
                       <span className="w-12">SL</span>
                       <span className="flex-1">ITEM DESCRIPTION</span>
                       <span className="w-20 text-center">QTY</span>
                       <span className="w-24 text-right">UNIT PRICE</span>
                    </div>
                    <div className={`p-12 text-center italic text-gray-300 font-bold uppercase tracking-tighter text-[10px] ${isTally ? 'bg-white' : ''}`}>
                       Product list will expand dynamically here
                    </div>
                </div>

                {/* 5. BELOW_ITEMS Custom Fields */}
                <div className="space-y-2 mb-8 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Internal Tracking / Transport</p>
                    {localTemplate.customFields.filter(f => f.position === 'BELOW_ITEMS').map(f => (
                      <FieldEditor 
                        key={f.id} 
                        field={f} 
                        onUpdate={(updated) => setLocalTemplate({...localTemplate, customFields: localTemplate.customFields.map(cf => cf.id === f.id ? updated : cf)})}
                        onRemove={() => setLocalTemplate({...localTemplate, customFields: localTemplate.customFields.filter(cf => cf.id !== f.id)})}
                      />
                    ))}
                </div>

                {/* 6. Totals & Footer */}
                <div className="flex justify-between items-start pt-10 border-t-2 border-gray-100">
                    <div className="space-y-6 flex-1 pr-10">
                       <div className="space-y-2">
                          {localTemplate.customFields.filter(f => f.position === 'FOOTER').map(f => (
                             <FieldEditor 
                              key={f.id} 
                              field={f} 
                              onUpdate={(updated) => setLocalTemplate({...localTemplate, customFields: localTemplate.customFields.map(cf => cf.id === f.id ? updated : cf)})}
                              onRemove={() => setLocalTemplate({...localTemplate, customFields: localTemplate.customFields.filter(cf => cf.id !== f.id)})}
                            />
                          ))}
                       </div>
                       <p className="text-[10px] text-gray-400 max-w-[300px] leading-relaxed">Declaration: certified that all particulars are true and items are sold in accordance with tax laws.</p>
                       <div className="pt-10">
                          <p className="font-black text-[9px] uppercase mb-12">Authorized Signatory</p>
                          <div className="w-48 h-px bg-gray-900" />
                       </div>
                    </div>
                    <div className={`w-64 space-y-3 p-6 ${isTally ? 'bg-gray-900 text-white' : isModern ? 'bg-indigo-600 text-white rounded-3xl' : 'border-t-4 border-gray-900'}`}>
                       <div className="flex justify-between text-xs font-bold opacity-70"><span>SUBTOTAL</span><span>₹0.00</span></div>
                       <div className="flex justify-between text-xs font-bold opacity-70"><span>GST (18%)</span><span>₹0.00</span></div>
                       <div className="flex justify-between font-black text-lg border-t border-white/20 pt-3"><span>TOTAL</span><span>₹0.00</span></div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Brand Identity</h2>
          <p className="text-gray-500 font-medium">Design how your business looks to your customers.</p>
        </div>
        <button 
          onClick={startNew}
          className="flex items-center space-x-3 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
        >
          <Palette size={24} />
          <span>New Identity</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map(t => {
          const isSystem = t.id === 'default';
          return (
            <div key={t.id} className={`bg-white p-8 rounded-[40px] border-4 transition-all group relative ${t.isDefault ? 'border-indigo-600 shadow-2xl scale-[1.02]' : 'border-transparent shadow-sm hover:border-indigo-100 hover:shadow-xl'}`}>
              <div className="flex justify-between items-start mb-6">
                 <div className={`p-4 rounded-3xl ${isSystem ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white shadow-lg'}`}>
                   <FileText size={32} />
                 </div>
                 <div className="flex flex-col items-end space-y-2">
                   {isSystem && (
                     <span className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[9px] font-black uppercase">
                       <Lock size={10} />
                       <span>LOCKED</span>
                     </span>
                   )}
                   {t.isDefault && (
                     <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Primary</span>
                   )}
                 </div>
              </div>
              
              <h3 className="text-2xl font-black text-gray-900">{t.name}</h3>
              <div className="flex items-center space-x-2 mt-2">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isSystem ? 'Baseline' : `${t.baseStyle}`}</span>
                 <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                 <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{t.paperFormat || 'A4'} SIZE</span>
              </div>
              
              <div className="mt-10 flex items-center justify-between">
                {isSystem ? (
                  <div className="flex items-center space-x-2 text-gray-400 py-3">
                    <ShieldAlert size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protected System Template</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleEdit(t)} 
                    className="flex items-center space-x-2 text-indigo-600 font-black text-sm hover:bg-indigo-50 px-5 py-3 rounded-2xl transition-all active:scale-95"
                  >
                    <Edit size={16} />
                    <span>Customize</span>
                  </button>
                )}
                
                {!t.isDefault && (
                  <button 
                    onClick={() => setAsDefault(t.id)}
                    className="bg-gray-50 text-gray-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FieldEditor: React.FC<{ 
  field: CustomField; 
  onUpdate: (f: CustomField) => void; 
  onRemove: () => void; 
}> = ({ field, onUpdate, onRemove }) => {
  return (
    <div className="group relative bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center justify-between space-x-3 animate-in fade-in slide-in-from-left-2 duration-300 hover:bg-white hover:shadow-md transition-all">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <input 
          type="text" 
          value={field.label} 
          onChange={e => onUpdate({...field, label: e.target.value})}
          className="bg-transparent border-none p-0 focus:ring-0 font-black text-gray-900 w-32 shrink-0 text-[10px] uppercase tracking-tighter"
        />
        <div className="h-4 w-px bg-gray-200" />
        <input 
          type="text" 
          value={field.defaultValue} 
          onChange={e => onUpdate({...field, defaultValue: e.target.value})}
          placeholder={field.isEditable ? "Filled at sale time..." : "Fixed standard text..."}
          className="bg-transparent border-none p-0 focus:ring-0 text-indigo-500 flex-1 italic text-[10px] truncate"
          disabled={field.isEditable}
        />
      </div>
      
      <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onUpdate({...field, isEditable: !field.isEditable})}
          className={`p-2 rounded-xl transition-all ${field.isEditable ? 'text-indigo-600 bg-white shadow-sm border border-indigo-50' : 'text-gray-300 hover:text-indigo-400'}`}
          title={field.isEditable ? "Change to Fixed Text" : "Change to Manual Input"}
        >
          {field.isEditable ? <Edit size={14} /> : <Lock size={14} />}
        </button>
        <button onClick={onRemove} className="p-2 text-red-300 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default TemplateDesigner;
