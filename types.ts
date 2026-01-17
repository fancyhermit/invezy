
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  INVOICES = 'INVOICES',
  CREATE_INVOICE = 'CREATE_INVOICE',
  PRODUCTS = 'PRODUCTS',
  CUSTOMERS = 'CUSTOMERS',
  AI_BILLING = 'AI_BILLING',
  PROFILES = 'PROFILES',
  DESIGN_TEMPLATES = 'DESIGN_TEMPLATES'
}

export interface CustomField {
  id: string;
  label: string;
  defaultValue: string;
  isEditable: boolean; // If true, it shows up in the 'Details' section during billing
  position: 'HEADER' | 'FOOTER' | 'ABOVE_ITEMS' | 'BELOW_ITEMS';
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  baseStyle: 'TALLY' | 'MODERN' | 'MINIMAL';
  accentColor: string;
  customFields: CustomField[];
  isDefault: boolean;
}

export interface BusinessProfile {
  id: string;
  name: string;
  address: string;
  gstin: string;
  phone: string;
  email: string;
  isDefault: boolean;
}

export interface ProductDynamicField {
  label: string;
  defaultValue: string;
  isDynamic: boolean; // If true, must be filled during billing
}

export interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
  category: string;
  dynamicFields?: ProductDynamicField[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  gstin?: string;
  address: string;
}

export interface LineItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  taxRate: number;
  dynamicValues?: Record<string, string>; // Values for item-specific dynamic fields
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  items: LineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  profileId: string;
  templateId?: string;
  customFieldData?: Record<string, string>; // Stores values for editable custom fields
}
