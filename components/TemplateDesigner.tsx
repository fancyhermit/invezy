
import React, { useState } from 'react';
import { InvoiceTemplate, CustomField } from '../types';
import { Layout, Palette, Plus, Save, Trash2, Wand2, Type as TypeIcon, Edit, Lock, ChevronDown, CheckCircle, ShieldAlert, FileText } from 'lucide-react';

interface Props {
  templates: InvoiceTemplate[];
  onUpdate: (templates: InvoiceTemplate[]) => void;
}

const TemplateDesigner: React.FC<Props> = ({ templates, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localTemplate, setLocalTemplate] = useState<InvoiceTemplate | null>(null);

  const startNew = () => {
    const fresh: InvoiceTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Custom Template',
      baseStyle: 'TALLY',
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
    setLocalTemplate({ ...t });
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

    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 font-bold">Back</button>
            <h2 className="text-2xl font-bold">Customize Template</h2>
          </div>
          <button onClick={handleSave} className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg">
            <Save size={18} />
            <span>Save Template</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Template Name</label>
                <input 
                  type="text" 
                  value={localTemplate.name} 
                  onChange={e => setLocalTemplate({...localTemplate, name: e.target.value})}
                  className="w-full mt-1 bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Base Layout Style</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['TALLY', 'MODERN', 'MINIMAL'].map((s: any) => (
                    <button 
                      key={s} 
                      onClick={() => setLocalTemplate({...localTemplate, baseStyle: s})}
                      className={`py-3 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center justify-center space-y-1 ${localTemplate.baseStyle === s ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-gray-100 text-gray-400 hover:border-indigo-200'}`}
                    >
                      <Layout size={14} />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Brand Theme Color</label>
                <div className="flex space-x-2 mt-2">
                  {['#4f46e5', '#db2777', '#059669', '#000000', '#f59e0b'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setLocalTemplate({...localTemplate, accentColor: c})}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${localTemplate.accentColor === c ? 'border-indigo-200 scale-110 shadow-md' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h4 className="font-bold text-gray-900 flex items-center space-x-2">
                <Plus size={18} className="text-indigo-600" />
                <span>Insert New Fields</span>
              </h4>
              <p className="text-xs text-gray-400">Add business specific data points like Transport or Bank details.</p>
              
              <div className="space-y-2">
                {[
                  { id: 'HEADER', label: 'Header Detail' },
                  { id: 'ABOVE_ITEMS', label: 'Above Items' },
                  { id: 'BELOW_ITEMS', label: 'Below Items' },
                  { id: 'FOOTER', label: 'Footer Detail' }
                ].map((pos) => (
                  <button 
                    key={pos.id}
                    onClick={() => addField(pos.id as any)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl text-left transition-all group"
                  >
                    <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600">{pos.label}</span>
                    <Plus size={16} className="text-indigo-400 group-hover:scale-125 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Designer Preview - DYNAMIC LAYOUT ENGINE */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-gray-200/50 p-8 rounded-[40px] min-h-[600px] border-4 border-dashed border-gray-300 flex flex-col items-center">
               
               {/* THE INVOICE SHEET */}
               <div className={`bg-white w-full max-w-[600px] shadow-2xl rounded-sm p-8 text-[10px] leading-tight space-y-6 transition-all duration-500 ${isTally ? 'font-mono' : 'font-sans'}`}>
                 
                 {/* 1. Header Area */}
                 <div className={`flex justify-between items-start ${isMinimal ? 'border-b pb-6' : isTally ? 'border-b-2 border-gray-900 pb-4' : 'bg-gray-50 -m-8 p-8 mb-6 rounded-t-sm border-b border-gray-100'}`}>
                    <div className="space-y-1 flex-1">
                       <h1 className={`text-2xl font-black uppercase mb-2`} style={{ color: localTemplate.accentColor }}>{isModern ? 'BRAND' : 'BUSINESS'} NAME</h1>
                       <p className="opacity-60">123 Industrial Area, Phase II</p>
                       <p className="opacity-60">GSTIN: 27AAAAA0000A1Z5</p>
                       
                       {/* Header Custom Fields */}
                       <div className="space-y-1 mt-4">
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
                       <div className={`${isTally ? 'bg-gray-900 text-white' : 'bg-indigo-600 text-white'} px-4 py-1 inline-block mb-3 font-bold`}>TAX INVOICE</div>
                       <p className="font-bold">INV-2024-001</p>
                       <p className="text-gray-400">Dated: {new Date().toLocaleDateString()}</p>
                    </div>
                 </div>

                 {/* 2. Billing Info */}
                 <div className={`grid grid-cols-2 gap-8 ${isModern ? 'pt-4' : ''}`}>
                    <div className={`${isTally ? 'border border-gray-300 p-3 bg-gray-50' : isMinimal ? 'pb-4 border-b' : ''}`}>
                       <p className="font-black text-[8px] uppercase tracking-widest text-gray-400 mb-2">Billed To:</p>
                       <p className="text-sm font-black">Acme Corporation Ltd</p>
                       <p className="text-gray-500 mt-1">Tech Park, Mumbai, MH</p>
                    </div>
                    <div className={`${isTally ? 'border border-gray-300 p-3 bg-gray-50' : isMinimal ? 'pb-4 border-b' : ''}`}>
                       <p className="font-black text-[8px] uppercase tracking-widest text-gray-400 mb-2">Shipping Details:</p>
                       <p className="text-gray-400 italic">Same as billing address</p>
                    </div>
                 </div>

                 {/* 3. ABOVE_ITEMS Custom Fields */}
                 <div className="space-y-2 py-2">
                    <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-1">Above Items Content</p>
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
                 <div className={`w-full overflow-hidden ${isTally ? 'border-2 border-gray-900' : isMinimal ? 'border-y-2 border-gray-100 py-4' : 'rounded-xl border border-gray-100'}`}>
                    <div className={`flex font-bold p-2 ${isTally ? 'bg-gray-100 border-b-2 border-gray-900' : isModern ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400'}`}>
                       <span className="w-12">SL</span>
                       <span className="flex-1">DESCRIPTION</span>
                       <span className="w-16 text-center">QTY</span>
                       <span className="w-20 text-right">PRICE</span>
                    </div>
                    <div className={`p-2 h-20 flex flex-col justify-center text-center italic text-gray-300 ${isTally ? 'bg-white' : ''}`}>
                       Item rows will appear here during billing...
                    </div>
                 </div>

                 {/* 5. BELOW_ITEMS Custom Fields */}
                 <div className="space-y-2 py-2 border-l-2 border-indigo-100 pl-4">
                    <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-1">Below Items Content</p>
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
                 <div className="flex justify-between items-start pt-6 border-t border-gray-100">
                    <div className="space-y-4 flex-1">
                       <div className="space-y-1">
                          {localTemplate.customFields.filter(f => f.position === 'FOOTER').map(f => (
                             <FieldEditor 
                              key={f.id} 
                              field={f} 
                              onUpdate={(updated) => setLocalTemplate({...localTemplate, customFields: localTemplate.customFields.map(cf => cf.id === f.id ? updated : cf)})}
                              onRemove={() => setLocalTemplate({...localTemplate, customFields: localTemplate.customFields.filter(cf => cf.id !== f.id)})}
                            />
                          ))}
                       </div>
                       <p className="text-[8px] text-gray-400 max-w-[200px]">Declaration: Certified that all particulars are true and items mentioned above are non-returnable.</p>
                    </div>
                    <div className={`w-40 space-y-2 p-3 ${isTally ? 'bg-gray-900 text-white' : isModern ? 'bg-indigo-600 text-white rounded-xl' : 'border-t-2 border-gray-900'}`}>
                       <div className="flex justify-between text-[8px] opacity-70"><span>Subtotal</span><span>₹0.00</span></div>
                       <div className="flex justify-between text-[8px] opacity-70"><span>Tax (18%)</span><span>₹0.00</span></div>
                       <div className="flex justify-between font-black text-xs border-t border-white/20 pt-1"><span>TOTAL</span><span>₹0.00</span></div>
                    </div>
                 </div>
               </div>

               <div className="mt-8 flex items-center space-x-6">
                 <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <Palette size={14} className="text-indigo-500" />
                    <span>Live Theme Preview</span>
                 </div>
                 <div className="flex items-center space-x-2 bg-indigo-600 px-4 py-2 rounded-full shadow-sm text-[10px] font-bold text-white uppercase tracking-widest">
                    <CheckCircle size={14} />
                    <span>Real-time Rendering</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Invoice Designer</h2>
          <p className="text-gray-500">Create professional custom templates to match your brand identity.</p>
        </div>
        <button 
          onClick={startNew}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
        >
          <Palette size={20} />
          <span>New Design</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => {
          const isSystem = t.id === 'default';
          return (
            <div key={t.id} className={`bg-white p-6 rounded-3xl border-2 transition-all group ${t.isDefault ? 'border-indigo-600 shadow-xl ring-4 ring-indigo-50' : 'border-gray-100 shadow-sm hover:border-indigo-200'}`}>
              <div className="flex justify-between items-start mb-4">
                 <div className={`p-3 rounded-xl ${isSystem ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all'}`}>
                   <FileText size={24} />
                 </div>
                 <div className="flex items-center space-x-2">
                   {isSystem && (
                     <span className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                       <Lock size={10} />
                       <span>LOCKED</span>
                     </span>
                   )}
                   {t.isDefault && (
                     <span className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Active</span>
                   )}
                 </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t.name}</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                {isSystem ? 'System Baseline' : `${t.baseStyle} Format`}
              </p>
              
              <div className="mt-8 flex items-center justify-between">
                {isSystem ? (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <ShieldAlert size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protected Asset</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleEdit(t)} 
                    className="flex items-center space-x-2 text-indigo-600 font-bold text-sm hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Edit size={14} />
                    <span>Customize</span>
                  </button>
                )}
                
                {!t.isDefault && (
                  <button 
                    onClick={() => setAsDefault(t.id)}
                    className="bg-gray-50 text-gray-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    Use as Primary
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Magic Generator */}
        <div 
          onClick={startNew}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-white transition-all group"
        >
          <div className="p-4 bg-white rounded-2xl text-indigo-500 mb-3 group-hover:scale-110 shadow-sm transition-transform">
            <Wand2 size={32} />
          </div>
          <h4 className="font-bold text-indigo-900">Custom Brand</h4>
          <p className="text-xs text-indigo-400 mt-1">Design a unique layout for your business.</p>
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual field controls
const FieldEditor: React.FC<{ 
  field: CustomField; 
  onUpdate: (f: CustomField) => void; 
  onRemove: () => void; 
}> = ({ field, onUpdate, onRemove }) => {
  return (
    <div className="group relative bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/50 flex items-center justify-between space-x-2 animate-in fade-in slide-in-from-left-2 duration-200 hover:bg-white hover:shadow-sm transition-all">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <input 
          type="text" 
          value={field.label} 
          onChange={e => onUpdate({...field, label: e.target.value})}
          className="bg-transparent border-none p-0 focus:ring-0 font-bold text-gray-800 w-28 shrink-0 text-[10px] uppercase tracking-tighter"
          title="Change Field Name"
        />
        <div className="h-4 w-px bg-indigo-100" />
        <input 
          type="text" 
          value={field.defaultValue} 
          onChange={e => onUpdate({...field, defaultValue: e.target.value})}
          placeholder={field.isEditable ? "Input at billing..." : "Fixed Standard Text..."}
          className="bg-transparent border-none p-0 focus:ring-0 text-indigo-400 flex-1 italic text-[9px] truncate"
          disabled={field.isEditable}
        />
      </div>
      
      <div className="flex items-center space-x-1 shrink-0">
        <button 
          onClick={() => onUpdate({...field, isEditable: !field.isEditable})}
          className={`p-1.5 rounded-lg transition-all ${field.isEditable ? 'text-indigo-600 bg-white shadow-xs' : 'text-gray-300 hover:text-indigo-400'}`}
          title={field.isEditable ? "Set to: Ask for value when creating bill" : "Set to: Fixed standard text"}
        >
          {field.isEditable ? <Edit size={12} /> : <Lock size={12} />}
        </button>
        <button onClick={onRemove} className="p-1.5 text-red-200 hover:text-red-500 transition-colors">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default TemplateDesigner;
