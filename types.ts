
export enum View {
  DASHBOARD = 'dashboard',
  ESTIMATE = 'estimate',
  HISTORY = 'history',
  SETTINGS = 'settings',
}

export interface LineItem {
  id: string;
  name:string;
  quantity: number;
  unitPrice: number;
}

export type ProductType = 'Pillow' | 'Silk Cotton Bed' | 'Sofa Cushion' | 'Custom';

export interface Product {
  id: string;
  type: ProductType;
  customName: string; // for type 'Custom'
  quantity: number;
  height: string;
  width: string;
  unit: 'ft' | 'in' | 'cm';
  lineItems: LineItem[];
  unitPrice?: number; // Base price for the product itself
}


export enum DocumentStatus {
  DRAFT = 'Draft',
  FINALIZED = 'Finalized',
  PAID = 'Paid',
  PARTIALLY_PAID = 'Partially Paid',
  DUE = 'Due',
}

export enum PaymentMethod {
    CASH = 'Cash',
    CARD = 'Card',
    UPI = 'UPI',
    BANK_TRANSFER = 'Bank Transfer'
}

export interface DocumentPreferences {
  // Visibility Toggles
  showDate: boolean;
  showStatus: boolean;
  showPaymentMethod: boolean;
  showTerms: boolean;
  showNotes: boolean;
  showSummary: boolean; // Master toggle for the summary block
  showSubtotal: boolean;
  showLabour: boolean;
  showDiscount: boolean;
  showTotal: boolean;
  showAmountPaid: boolean;
  showBalance: boolean;
  showProductPrice: boolean; // Toggles Rate and Amount columns (e.g. for Delivery Challan)

  // Custom Labels
  dateLabel: string;
  termsLabel: string;
  notesLabel: string;
  subtotalLabel: string;
  totalLabel: string;
  balanceLabel: string;
}

interface BaseDocument {
  id: string;
  number: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  date: string;
  products: Product[];
  labourCharge: number;
  discountAmount: number;
  notes: string;
  subtotal: number;
  total: number;
  preferences: DocumentPreferences;
}

export interface Estimate extends BaseDocument {
  type: 'estimate';
  status: DocumentStatus.DRAFT | DocumentStatus.FINALIZED;
}

export interface Bill extends BaseDocument {
  type: 'bill';
  estimateId?: string;
  status: DocumentStatus.PAID | DocumentStatus.PARTIALLY_PAID | DocumentStatus.DUE;
  amountPaid: number;
  paymentMethod?: PaymentMethod;
  terms: string;
}

export type Document = Estimate | Bill;

export interface SettingsProfile {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  logo: string; // base64 string
  currency: string;
  defaultTerms: string;
  paymentUPI?: string;
  // Visual Customization
  themeColor: string;
  fontFamily: string;
}
