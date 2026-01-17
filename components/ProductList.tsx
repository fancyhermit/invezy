
import React, { useState } from 'react';
import { Product, ProductDynamicField } from '../types';
import { Plus, Search, Package, AlertTriangle, Edit3, X, Save, Lock, Edit, Trash2, Info, Keyboard, Anchor } from 'lucide-react';

interface Props {
  products: Product[];
  onUpdate: (updated: Product) => void;
  onAdd: (newProd: Product) => void;
}

const ProductList: React.FC<Props> = ({ products, onUpdate, onAdd }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    dynamicFields: []
  });

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p, dynamicFields: p.dynamicFields || [] });
  };

  const startAdd = () => {
    setIsAddingNew(true);
    setFormData({
      name: '',
      price: 0,
      sku: `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      stock: 0,
      category: 'General',
      dynamicFields: []
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return;

    if (editingProduct) {
      onUpdate({ ...editingProduct, ...formData } as Product);
    } else {
      onAdd({ 
        ...formData, 
        id: Math.random().toString(36).substr(2, 9) 
      } as Product);
    }
    closeModals();
  };

  const addDynamicField = () => {
    const fields = [...(formData.dynamicFields || [])];
    fields.push({ label: 'New Detail', defaultValue: '', isDynamic: true });
    setFormData({ ...formData, dynamicFields: fields });
  };

  const removeDynamicField = (index: number) => {
    const fields = [...(formData.dynamicFields || [])];
    fields.splice(index, 1);
    setFormData({ ...formData, dynamicFields: fields });
  };

  const updateDynamicField = (index: number, updates: Partial<ProductDynamicField>) => {
    const fields = [...(formData.dynamicFields || [])];
    fields[index] = { ...fields[index], ...updates };
    setFormData({ ...formData, dynamicFields: fields });
  };

  const closeModals = () => {
    setEditingProduct(null);
    setIsAddingNew(false);
    setFormData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
          <p className="text-gray-500">Manage products and custom item-specific data points.</p>
        </div>
        <button onClick={startAdd} className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
          <Plus size={20} /><span>Add Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Package size={24} /></div>
              <button onClick={() => startEdit(p)} className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"><Edit3 size={18} /></button>
            </div>
            <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
            <p className="text-sm text-gray-400 font-medium mb-4">SKU: {p.sku} • {p.category}</p>
            
            {p.dynamicFields && p.dynamicFields.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {p.dynamicFields.map(f => (
                  <span key={f.label} className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-tighter border ${f.isDynamic ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    {f.isDynamic ? 'Manual' : 'Fixed'}: {f.label}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-end justify-between border-t border-gray-50 pt-4">
              <div><p className="text-xs text-gray-400 font-bold uppercase mb-1">Price</p><p className="text-xl font-black text-indigo-600">₹{p.price}</p></div>
              <div className="text-right"><p className="text-xs text-gray-400 font-bold uppercase mb-1">Stock</p><p className="text-lg font-bold text-gray-900">{p.stock}</p></div>
            </div>
          </div>
        ))}
      </div>

      {(editingProduct || isAddingNew) && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-3xl p-10 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-black text-gray-900">{isAddingNew ? 'New Inventory Item' : 'Edit Product'}</h3>
                <p className="text-sm text-gray-400">Define basic info and unique sale details.</p>
              </div>
              <button onClick={closeModals} className="p-3 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
              <div className="space-y-6">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                  <div className="w-6 h-px bg-gray-200"></div>
                  <span>Standard Product Details</span>
                </p>
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Product Name</label><input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg" placeholder="e.g. BMW X5 M-Sport"/></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Stock SKU</label><input type="text" value={formData.sku || ''} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none uppercase text-sm font-medium"/></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Category</label><input type="text" value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"/></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Selling Price (₹)</label><input type="number" value={formData.price || 0} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full bg-indigo-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-black text-xl text-indigo-700"/></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Current Stock</label><input type="number" value={formData.stock || 0} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"/></div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <p className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center space-x-2">
                    <div className="w-6 h-px bg-indigo-100"></div>
                    <span>Unique Tracking Details</span>
                  </p>
                  <button onClick={addDynamicField} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md hover:bg-indigo-700 transition-all uppercase tracking-widest">
                    <Plus size={14} />
                    <span>Add New</span>
                  </button>
                </div>
                
                <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
                  {formData.dynamicFields?.length === 0 ? (
                    <div className="text-center py-16 border-4 border-dashed border-gray-50 rounded-[32px] text-gray-400 space-y-3">
                      <div className="flex justify-center"><Info size={32} /></div>
                      <p className="text-sm font-medium max-w-[200px] mx-auto">Add details like Serial #, IMEI, or Chassis # that vary per sale.</p>
                    </div>
                  ) : (
                    formData.dynamicFields?.map((f, idx) => (
                      <div key={idx} className={`p-5 rounded-[24px] border-2 transition-all space-y-4 animate-in slide-in-from-right-4 duration-300 ${f.isDynamic ? 'bg-indigo-50/30 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center justify-between">
                           <div className="flex-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Detail Name</label>
                              <input 
                                type="text" 
                                value={f.label} 
                                onChange={e => updateDynamicField(idx, { label: e.target.value })} 
                                className="bg-transparent border-none p-0 text-base font-black text-gray-900 focus:ring-0 w-full placeholder-gray-300" 
                                placeholder="e.g. IMEI Number"
                              />
                           </div>
                           <button onClick={() => removeDynamicField(idx)} className="p-2 text-red-300 hover:text-red-500 hover:bg-white rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">How should this behave during billing?</label>
                          <div className="grid grid-cols-2 gap-2">
                             <button 
                              onClick={() => updateDynamicField(idx, { isDynamic: true })}
                              className={`flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-all ${f.isDynamic ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm' : 'bg-gray-100/50 border-transparent text-gray-400'}`}
                             >
                               <Keyboard size={16} />
                               <div className="text-left">
                                 <p className="text-[10px] font-black uppercase leading-none mb-1">Enter Per Sale</p>
                                 <p className="text-[8px] opacity-60 font-medium leading-none">e.g. Serial, IMEI</p>
                               </div>
                             </button>

                             <button 
                              onClick={() => updateDynamicField(idx, { isDynamic: false })}
                              className={`flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-all ${!f.isDynamic ? 'bg-white border-gray-600 text-gray-900 shadow-sm' : 'bg-gray-100/50 border-transparent text-gray-400'}`}
                             >
                               <Anchor size={16} />
                               <div className="text-left">
                                 <p className="text-[10px] font-black uppercase leading-none mb-1">Fixed Value</p>
                                 <p className="text-[8px] opacity-60 font-medium leading-none">e.g. Model, Color</p>
                               </div>
                             </button>
                          </div>

                          {!f.isDynamic && (
                            <div className="pt-2">
                               <label className="text-[9px] font-black text-gray-500 uppercase block mb-1">Fixed Standard Value</label>
                               <input 
                                type="text" 
                                value={f.defaultValue} 
                                onChange={e => updateDynamicField(idx, { defaultValue: e.target.value })} 
                                placeholder="Value used for every bill..."
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-gray-400 outline-none"
                               />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100">
              <button onClick={closeModals} className="px-8 py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors">Discard Changes</button>
              <button onClick={handleSave} className="flex items-center space-x-3 bg-indigo-600 text-white px-10 py-4 rounded-[20px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"><Save size={20} /><span>{isAddingNew ? 'Create Product' : 'Save Changes'}</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
