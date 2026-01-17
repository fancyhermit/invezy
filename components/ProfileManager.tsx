
import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { Plus, Check, Trash2, Building2, Phone, Mail, MapPin, Hash } from 'lucide-react';

interface Props {
  profiles: BusinessProfile[];
  activeId: string;
  onSwitch: (id: string) => void;
  onUpdate: (profiles: BusinessProfile[]) => void;
}

const ProfileManager: React.FC<Props> = ({ profiles, activeId, onSwitch, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [newProfile, setNewProfile] = useState<Partial<BusinessProfile>>({
    name: '', address: '', gstin: '', phone: '', email: ''
  });

  const handleAdd = () => {
    if (!newProfile.name) return;
    const profile: BusinessProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProfile.name!,
      address: newProfile.address || '',
      gstin: newProfile.gstin || '',
      phone: newProfile.phone || '',
      email: newProfile.email || '',
      isDefault: false
    };
    onUpdate([...profiles, profile]);
    setShowForm(false);
    setNewProfile({ name: '', address: '', gstin: '', phone: '', email: '' });
  };

  const handleDelete = (id: string) => {
    if (profiles.length === 1) return;
    onUpdate(profiles.filter(p => p.id !== id));
    if (activeId === id) onSwitch(profiles.find(p => p.id !== id)!.id);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Business Profiles</h2>
          <p className="text-gray-500">Manage multiple business entities from one dashboard.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} />
          <span>Add Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map(p => (
          <div 
            key={p.id} 
            className={`bg-white p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              activeId === p.id ? 'border-indigo-600 shadow-xl' : 'border-gray-100 shadow-sm hover:border-indigo-200'
            }`}
            onClick={() => onSwitch(p.id)}
          >
            {activeId === p.id && (
              <div className="absolute top-0 right-0 bg-indigo-600 text-white p-2 rounded-bl-2xl">
                <Check size={16} />
              </div>
            )}
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">GSTIN: {p.gstin || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <div className="flex items-center space-x-3"><Phone size={14} className="text-gray-400" /> <span>{p.phone}</span></div>
              <div className="flex items-center space-x-3"><Mail size={14} className="text-gray-400" /> <span>{p.email}</span></div>
              <div className="flex items-center space-x-3"><MapPin size={14} className="text-gray-400" /> <span>{p.address}</span></div>
            </div>

            <div className="flex justify-between items-center mt-auto">
              <span className={`text-xs font-bold ${activeId === p.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                {activeId === p.id ? 'Currently Active' : 'Click to Switch'}
              </span>
              {profiles.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-6">Add New Business Profile</h3>
            <div className="space-y-4">
              <input 
                placeholder="Business Name" 
                className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newProfile.name}
                onChange={e => setNewProfile({...newProfile, name: e.target.value})}
              />
              <input 
                placeholder="GSTIN (Optional)" 
                className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newProfile.gstin}
                onChange={e => setNewProfile({...newProfile, gstin: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="Phone" 
                  className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newProfile.phone}
                  onChange={e => setNewProfile({...newProfile, phone: e.target.value})}
                />
                <input 
                  placeholder="Email" 
                  className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newProfile.email}
                  onChange={e => setNewProfile({...newProfile, email: e.target.value})}
                />
              </div>
              <textarea 
                placeholder="Full Address" 
                className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                value={newProfile.address}
                onChange={e => setNewProfile({...newProfile, address: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-400 font-bold">Cancel</button>
              <button onClick={handleAdd} className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg">Save Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManager;
