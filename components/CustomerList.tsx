
import React from 'react';
import { Customer } from '../types';
import { UserPlus, Mail, Phone, MapPin } from 'lucide-react';

interface Props {
  customers: Customer[];
}

const CustomerList: React.FC<Props> = ({ customers }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-500">Maintain relationships and track billing history.</p>
        </div>
        <button className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
          <UserPlus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl">
                {c.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{c.name}</h3>
                <p className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-widest">Premium Client</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500 space-x-3 bg-gray-50 p-3 rounded-2xl">
                <Phone size={16} className="text-gray-400" />
                <span>{c.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 space-x-3 bg-gray-50 p-3 rounded-2xl">
                <Mail size={16} className="text-gray-400" />
                <span>{c.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 space-x-3 bg-gray-50 p-3 rounded-2xl">
                <MapPin size={16} className="text-gray-400 shrink-0" />
                <span className="truncate">{c.address}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between">
              <button className="text-sm font-bold text-indigo-600 hover:underline">View History</button>
              <button className="text-sm font-bold text-gray-400 hover:text-gray-600">Edit Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerList;
