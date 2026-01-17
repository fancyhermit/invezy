
import React, { useState } from 'react';
import { parseInvoiceText } from '../services/geminiService';
import { Product } from '../types';
import { Sparkles, Send, Mic, Camera, Loader2, Wand2 } from 'lucide-react';

interface Props {
  products: Product[];
  onParsed: (data: any) => void;
}

const AISmartBill: React.FC<Props> = ({ products, onParsed }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    const result = await parseInvoiceText(inputText);
    setIsProcessing(false);
    if (result) {
      alert(`AI detected: ${result.items.length} items for ${result.customerName || 'Walk-in customer'}. Redirecting to invoice form...`);
      onParsed(result);
    } else {
      alert("AI couldn't parse the text. Try being more specific with quantities and prices.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-100 rounded-3xl text-indigo-600 mb-2">
          <Sparkles size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-900">Magic Bill Creation</h2>
        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
          Type or speak naturally. Gemini AI will automatically extract items, prices, and customer details to build your invoice instantly.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-indigo-50">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder='Try: "Sold 2 coffee beans and 1 green tea to Rohan at 9876543210. Apply standard prices."'
            className="w-full h-40 bg-gray-50 border-none rounded-2xl p-4 text-lg focus:ring-0 outline-none resize-none no-scrollbar placeholder-gray-300"
          />
          
          <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-2">
              <button className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors">
                <Mic size={20} />
              </button>
              <button className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors">
                <Camera size={20} />
              </button>
            </div>
            
            <button
              onClick={handleProcess}
              disabled={isProcessing || !inputText.trim()}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold flex items-center space-x-2 shadow-lg disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  <span>Generate Magic Bill</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ExampleCard 
          icon={<Mic size={18} />} 
          title="Voice Command" 
          desc="Speak to create an invoice while handling customers."
        />
        <ExampleCard 
          icon={<Camera size={18} />} 
          title="Scan Paper" 
          desc="Take a photo of a rough estimate or older bill."
        />
        <ExampleCard 
          icon={<Send size={18} />} 
          title="WhatsApp Text" 
          desc="Copy-paste chat orders directly into SwipeLite."
        />
      </div>
    </div>
  );
};

const ExampleCard = ({ icon, title, desc }: any) => (
  <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center hover:border-indigo-200 transition-colors cursor-pointer group">
    <div className="inline-block p-2 bg-indigo-50 text-indigo-500 rounded-lg mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-all">
      {icon}
    </div>
    <h4 className="font-bold text-sm text-gray-800">{title}</h4>
    <p className="text-xs text-gray-400 mt-1">{desc}</p>
  </div>
);

export default AISmartBill;
