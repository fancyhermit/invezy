
import React, { useState, useEffect } from 'react';
import { AppView, Product, Customer, Invoice, BusinessProfile, InvoiceTemplate } from './types';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import ProductList from './components/ProductList';
import CustomerList from './components/CustomerList';
import AISmartBill from './components/AISmartBill';
import ProfileManager from './components/ProfileManager';
import TemplateDesigner from './components/TemplateDesigner';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Package, 
  Users, 
  Sparkles,
  Search,
  Menu,
  Settings,
  Building2,
  Palette
} from 'lucide-react';

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Premium Coffee Beans', price: 450, sku: 'COF-001', stock: 24, category: 'Beverages' },
  { id: '2', name: 'Organic Honey 500g', price: 320, sku: 'HON-002', stock: 15, category: 'Food' },
];

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'John Doe', phone: '9876543210', email: 'john@example.com', address: '123 Baker St, London' },
];

const INITIAL_PROFILES: BusinessProfile[] = [
  {
    id: 'p1',
    name: 'Main Business Hub',
    address: 'Sector 44, Gurgaon, HR 122003',
    gstin: '06AAAAA0000A1Z5',
    phone: '0124-555666',
    email: 'contact@businesshub.com',
    isDefault: true
  }
];

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('swipelite_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [profiles, setProfiles] = useState<BusinessProfile[]>(() => {
    const saved = localStorage.getItem('swipelite_profiles');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [templates, setTemplates] = useState<InvoiceTemplate[]>(() => {
    const saved = localStorage.getItem('swipelite_templates');
    return saved ? JSON.parse(saved) : [{
      id: 'default',
      name: 'Standard Tally',
      baseStyle: 'TALLY',
      accentColor: '#4f46e5',
      customFields: [],
      isDefault: true
    }];
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    const saved = localStorage.getItem('swipelite_active_profile_id');
    return saved || INITIAL_PROFILES[0].id;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('swipelite_products');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('swipelite_customers');
    return saved ? JSON.parse(saved) : MOCK_CUSTOMERS;
  });

  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);

  useEffect(() => { localStorage.setItem('swipelite_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('swipelite_profiles', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem('swipelite_active_profile_id', activeProfileId); }, [activeProfileId]);
  useEffect(() => { localStorage.setItem('swipelite_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('swipelite_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('swipelite_templates', JSON.stringify(templates)); }, [templates]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || INITIAL_PROFILES[0];
  const activeTemplate = templates.find(t => t.isDefault) || templates[0];

  const navigate = (view: AppView) => {
    if (view !== AppView.CREATE_INVOICE) setEditingInvoice(undefined);
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  const handleSaveInvoice = (newInvoice: Invoice) => {
    const existsIndex = invoices.findIndex(inv => inv.id === newInvoice.id);
    if (existsIndex > -1) {
      const updatedInvoices = [...invoices];
      updatedInvoices[existsIndex] = newInvoice;
      setInvoices(updatedInvoices);
    } else {
      setInvoices([newInvoice, ...invoices]);
    }
    setEditingInvoice(undefined);
    setCurrentView(AppView.INVOICES);
  };

  const handleUpdateProduct = (updated: Product) => setProducts(products.map(p => p.id === updated.id ? updated : p));
  const handleAddProduct = (newProd: Product) => setProducts([...products, newProd]);

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => navigate(view)}
      className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Building2 size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">SwipeLite</h1>
          </div>
          
          <nav className="flex-1 space-y-2">
            <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
            <NavItem view={AppView.INVOICES} icon={FileText} label="Invoices" />
            <NavItem view={AppView.CREATE_INVOICE} icon={PlusCircle} label="Create Invoice" />
            <NavItem view={AppView.AI_BILLING} icon={Sparkles} label="Magic Bill" />
            <NavItem view={AppView.DESIGN_TEMPLATES} icon={Palette} label="Design Invoice" />
            <NavItem view={AppView.PRODUCTS} icon={Package} label="Inventory" />
            <NavItem view={AppView.CUSTOMERS} icon={Users} label="Customers" />
            <NavItem view={AppView.PROFILES} icon={Settings} label="My Profiles" />
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-500"><Menu size={24} /></button>
          </div>
          <div className="flex-1 max-w-lg mx-4">
            <div className="text-sm font-semibold text-gray-600 hidden md:block">
              Business: <span className="text-indigo-600">{activeProfile.name}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {activeProfile.name.charAt(0)}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {currentView === AppView.DASHBOARD && <Dashboard invoices={invoices} products={products} onNewSale={() => navigate(AppView.CREATE_INVOICE)} />}
            {currentView === AppView.INVOICES && <InvoiceList invoices={invoices} onAdd={() => navigate(AppView.CREATE_INVOICE)} onEdit={(inv) => { setEditingInvoice(inv); navigate(AppView.CREATE_INVOICE); }} onDelete={(id) => setInvoices(invoices.filter(i => i.id !== id))} />}
            {currentView === AppView.CREATE_INVOICE && (
              <InvoiceForm 
                products={products} 
                customers={customers} 
                activeProfile={activeProfile}
                activeTemplate={activeTemplate}
                allTemplates={templates}
                initialInvoice={editingInvoice}
                onSave={handleSaveInvoice}
                onCancel={() => navigate(AppView.INVOICES)}
              />
            )}
            {currentView === AppView.DESIGN_TEMPLATES && <TemplateDesigner templates={templates} onUpdate={setTemplates} />}
            {currentView === AppView.AI_BILLING && <AISmartBill products={products} onParsed={() => navigate(AppView.CREATE_INVOICE)} />}
            {currentView === AppView.PRODUCTS && <ProductList products={products} onUpdate={handleUpdateProduct} onAdd={handleAddProduct} />}
            {currentView === AppView.CUSTOMERS && <CustomerList customers={customers} />}
            {currentView === AppView.PROFILES && <ProfileManager profiles={profiles} activeId={activeProfileId} onSwitch={setActiveProfileId} onUpdate={setProfiles} />}
          </div>
        </div>
      </main>
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default App;
