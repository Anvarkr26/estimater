
import React, { useState, useEffect } from 'react';
import { Estimate, Bill, LineItem, DocumentStatus, Document, SettingsProfile, PaymentMethod, Product, ProductType, DocumentPreferences } from '../types';
import { getAINameSuggestion, getAIPriceSuggestion } from '../services/geminiService';
import { exportAsPdf, exportAsImage, exportAsWord } from '../utils/exportUtils';
import { PrintableView } from './PrintableView';
import { PrintPreview } from './PrintPreview';

interface EstimateViewProps {
  activeDocument: Document | null;
  onSave: (doc: Estimate | Bill) => void;
  settings: SettingsProfile;
  getNextDocNumber: (type: 'estimate' | 'bill') => number;
}

// Icons
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.124 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const AdjustmentsHorizontalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
  </svg>
);
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


const predefinedProductTypes: { id: ProductType, name: string, requiresDimensions: boolean }[] = [
  { id: 'Silk Cotton Bed', name: 'Silk Cotton Bed', requiresDimensions: true },
  { id: 'Sofa Cushion', name: 'Sofa Cushion', requiresDimensions: true },
  { id: 'Pillow', name: 'Pillow', requiresDimensions: false },
  { id: 'Custom', name: 'Custom Product', requiresDimensions: false },
];

const defaultPreferences: DocumentPreferences = {
  showDate: true,
  showStatus: true,
  showPaymentMethod: true,
  showTerms: true,
  showNotes: true,
  showSummary: true,
  showSubtotal: true,
  showLabour: true,
  showDiscount: true,
  showTotal: true,
  showAmountPaid: true,
  showBalance: true,
  showProductPrice: true,
  dateLabel: 'Date',
  termsLabel: 'Terms & Conditions',
  notesLabel: 'Notes',
  subtotalLabel: 'Subtotal',
  totalLabel: 'Total',
  balanceLabel: 'Balance Due'
};


const getInitialState = (doc: Document | null, getNext: (type: 'estimate' | 'bill') => number): Estimate | Bill => {
    if (doc) {
      // Ensure existing documents get default preferences if missing
      return {
        ...doc,
        preferences: doc.preferences || defaultPreferences
      };
    }
    return {
        id: crypto.randomUUID(),
        type: 'estimate',
        number: `EST-${getNext('estimate')}`,
        status: DocumentStatus.DRAFT,
        customerName: '',
        customerPhone: '',
        customerAddress: 'Puducherry',
        date: new Date().toISOString().split('T')[0],
        products: [],
        labourCharge: 0,
        discountAmount: 0,
        notes: '',
        subtotal: 0,
        total: 0,
        preferences: defaultPreferences
    };
};

const TypeSwitcher: React.FC<{ value: 'estimate' | 'bill'; onChange: (type: 'estimate' | 'bill') => void; }> = ({ value, onChange }) => (
    <div className="flex items-center p-1 rounded-full bg-slate-200">
      <button
        onClick={() => onChange('estimate')}
        className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 ${
          value === 'estimate'
            ? 'bg-white shadow text-emerald-600'
            : 'text-slate-600 hover:bg-slate-300/50'
        }`}
        aria-pressed={value === 'estimate'}
      >
        Estimate
      </button>
      <button
        onClick={() => onChange('bill')}
        className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 ${
          value === 'bill'
            ? 'bg-white shadow text-emerald-600'
            : 'text-slate-600 hover:bg-slate-300/50'
        }`}
         aria-pressed={value === 'bill'}
      >
        Bill
      </button>
    </div>
);

export const EstimateView: React.FC<EstimateViewProps> = ({ activeDocument, onSave, settings, getNextDocNumber }) => {
  const [doc, setDoc] = useState<Estimate | Bill>(() => getInitialState(activeDocument, getNextDocNumber));
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiPriceLoading, setAiPriceLoading] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

  // The ID used for the hidden export element
  const EXPORT_ELEMENT_ID = "printable-view-export";

  useEffect(() => {
    const subtotal = doc.products.reduce((total, product) => {
        // Calculate Line Items Cost
        const productItemsTotal = product.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        // Calculate Base Product Cost (if set, mainly for Custom products)
        const productBaseCost = product.unitPrice || 0;
        
        // Total Unit Cost = Base Cost + Components Cost
        const unitTotal = productBaseCost + productItemsTotal;
        
        const productTotal = unitTotal * product.quantity;
        return total + productTotal;
    }, 0);
    const total = subtotal + doc.labourCharge - doc.discountAmount;
    setDoc(d => ({ ...d, subtotal, total }));
  }, [doc.products, doc.labourCharge, doc.discountAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDoc(d => ({ ...d, [name]: value }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDoc(d => ({ ...d, [name]: parseFloat(value) || 0 }));
  };
  
  const handlePreferenceChange = (key: keyof DocumentPreferences, value: string | boolean) => {
      setDoc(d => ({
          ...d,
          preferences: {
              ...d.preferences,
              [key]: value
          }
      }));
  };

  const handleProductChange = (productId: string, field: keyof Product, value: any) => {
    setDoc(d => ({
        ...d,
        products: d.products.map(p => p.id === productId ? { ...p, [field]: value } : p)
    }));
  };

  const handleLineItemChange = (productId: string, itemId: string, field: keyof LineItem, value: string | number) => {
    setDoc(d => ({
      ...d,
      products: d.products.map(p => 
        p.id === productId 
        ? { ...p, lineItems: p.lineItems.map(item => item.id === itemId ? { ...item, [field]: value } : item) }
        : p
      ),
    }));
  };
  
  const handleAddItem = (productId: string) => {
    const newItem: LineItem = { id: crypto.randomUUID(), name: '', quantity: 1, unitPrice: 0 };
    setDoc(d => ({
        ...d,
        products: d.products.map(p => p.id === productId ? { ...p, lineItems: [...p.lineItems, newItem] } : p)
    }));
  };
  
  const handleRemoveItem = (productId: string, itemId: string) => {
    setDoc(d => ({
        ...d,
        products: d.products.map(p => p.id === productId ? { ...p, lineItems: p.lineItems.filter(item => item.id !== itemId) } : p)
    }));
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
        id: crypto.randomUUID(),
        type: 'Silk Cotton Bed',
        customName: '',
        quantity: 1,
        height: '',
        width: '',
        unit: 'ft',
        lineItems: []
    };
    setDoc(d => ({ ...d, products: [...d.products, newProduct] }));
  };

  const handleRemoveProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to remove this entire product and its items?')) {
      setDoc(d => ({
          ...d,
          products: d.products.filter(p => p.id !== productId)
      }));
    }
  };


  const handleAISuggestion = async (productId: string, itemId: string, currentName: string) => {
    if(!currentName) return;
    setAiLoading(itemId);
    const suggestion = await getAINameSuggestion(currentName);
    handleLineItemChange(productId, itemId, 'name', suggestion);
    setAiLoading(null);
  };

  const handleAIPriceSuggestion = async (productId: string, itemId: string, currentName: string) => {
    if (!currentName) {
        alert("Please enter an item name first to get a price suggestion.");
        return;
    }
    setAiPriceLoading(itemId);
    const suggestion = await getAIPriceSuggestion(currentName);
    if (suggestion !== null) {
        handleLineItemChange(productId, itemId, 'unitPrice', suggestion);
    } else {
        alert("Could not suggest a price for this item.");
    }
    setAiPriceLoading(null);
  };


  const handleConvertToBill = () => {
    if (doc.type === 'estimate') {
        setDoc(prevDoc => ({
            ...prevDoc,
            id: crypto.randomUUID(),
            type: 'bill',
            number: `BILL-${getNextDocNumber('bill')}`,
            status: DocumentStatus.DUE,
            amountPaid: 0,
            paymentMethod: PaymentMethod.CASH,
            terms: settings.defaultTerms,
            estimateId: prevDoc.id,
        }));
    }
  };
  
  const handleTypeChange = (newType: 'estimate' | 'bill') => {
    if (newType === doc.type || activeDocument) return; // Only for new documents

    if (newType === 'bill') {
        setDoc(prevDoc => {
            const { ...estimateData } = prevDoc as Estimate;
            const newBill: Bill = {
                ...estimateData,
                type: 'bill',
                number: `BILL-${getNextDocNumber('bill')}`,
                status: DocumentStatus.DUE,
                amountPaid: 0,
                paymentMethod: PaymentMethod.CASH,
                terms: settings.defaultTerms,
            };
            return newBill;
        });
    } else {
        setDoc(prevDoc => {
            const { amountPaid, paymentMethod, terms, estimateId, ...billData } = prevDoc as Bill;
            const newEstimate: Estimate = {
                ...billData,
                type: 'estimate',
                number: `EST-${getNextDocNumber('estimate')}`,
                status: DocumentStatus.DRAFT,
            };
            return newEstimate;
        });
    }
  };
  
  const formInputClass = "w-full bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm p-2";
  const isBill = doc.type === 'bill';

  return (
    <>
    <div className="lg:grid lg:grid-cols-3 lg:gap-8 items-start">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
            {/* Document Header & Customer Info Card */}
            <div className="bg-white shadow-md rounded-xl p-6 md:p-8">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 capitalize">
                        {activeDocument ? `Editing ${doc.type} #${doc.number}` : `New ${doc.type}`}
                    </h2>
                    {!activeDocument && (
                        <div className="w-full sm:w-52">
                            <TypeSwitcher value={doc.type} onChange={handleTypeChange} />
                        </div>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 pt-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Customer Name</label>
                        <input type="text" name="customerName" value={doc.customerName} onChange={handleInputChange} className={formInputClass}/>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Customer Phone</label>
                        <input type="tel" name="customerPhone" value={doc.customerPhone} onChange={handleInputChange} className={formInputClass}/>
                    </div>
                    {/* Date moved here for common access */}
                    <div>
                        <div className="flex justify-between">
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Date</label>
                            <span className="text-xs text-slate-400 italic">Optional</span>
                        </div>
                        <input type="date" name="date" value={doc.date} onChange={handleInputChange} className={formInputClass}/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Customer Address</label>
                        <textarea name="customerAddress" value={doc.customerAddress} onChange={handleInputChange} rows={3} className={formInputClass}></textarea>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-700 px-1">Products</h3>
              {doc.products.map((product) => {
                const productDef = predefinedProductTypes.find(p => p.id === product.type);
                return (
                  <div key={product.id} className="bg-white shadow-md rounded-xl p-6 md:p-8 border border-slate-200">
                      {/* Product Header */}
                      <div className="flex flex-col md:flex-row gap-4 justify-between md:items-start mb-4 border-b border-slate-200 pb-4">
                        <div className="flex-grow space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Product Type</label>
                                <select value={product.type} onChange={(e) => handleProductChange(product.id, 'type', e.target.value)} className={formInputClass}>
                                    {predefinedProductTypes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Quantity</label>
                                <input type="number" min="1" value={product.quantity} onChange={(e) => handleProductChange(product.id, 'quantity', parseInt(e.target.value) || 1)} className={formInputClass} />
                            </div>
                          </div>

                          {product.type === 'Custom' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Custom Name</label>
                                <input type="text" placeholder="e.g., Chair Repair" value={product.customName} onChange={(e) => handleProductChange(product.id, 'customName', e.target.value)} className={formInputClass} />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Price (Optional)</label>
                                <input type="number" placeholder="Base Price" value={product.unitPrice || ''} onChange={(e) => handleProductChange(product.id, 'unitPrice', parseFloat(e.target.value) || 0)} className={formInputClass} />
                              </div>
                            </div>
                          )}

                          {productDef?.requiresDimensions && (
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Height</label>
                                <input type="text" placeholder="e.g., 6" value={product.height} onChange={(e) => handleProductChange(product.id, 'height', e.target.value)} className={formInputClass} />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Width</label>
                                <input type="text" placeholder="e.g., 4" value={product.width} onChange={(e) => handleProductChange(product.id, 'width', e.target.value)} className={formInputClass} />
                              </div>
                               <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Unit</label>
                                <select value={product.unit} onChange={(e) => handleProductChange(product.id, 'unit', e.target.value as Product['unit'])} className={formInputClass}>
                                    <option value="ft">feet</option>
                                    <option value="in">inches</option>
                                    <option value="cm">cm</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                        <button onClick={() => handleRemoveProduct(product.id)} className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50" aria-label="Remove product">
                          <TrashIcon className="h-5 w-5"/>
                        </button>
                      </div>

                      {/* Line Items for this product */}
                      <h4 className="text-md font-bold text-slate-600 mb-2">Items for this Product</h4>
                      <div className="space-y-3">
                        {product.lineItems.map(item => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center border-b border-slate-100 py-3 last:border-b-0">
                                <div className="col-span-12 md:col-span-5 relative">
                                    <input type="text" placeholder="Item Name" value={item.name} onChange={e => handleLineItemChange(product.id, item.id, 'name', e.target.value)} className={`${formInputClass} pr-10`} />
                                    <button onClick={() => handleAISuggestion(product.id, item.id, item.name)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 p-1 rounded-full hover:bg-emerald-100 transition-colors" disabled={aiLoading === item.id} aria-label="Suggest item name">
                                        {aiLoading === item.id ? <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="h-5 w-5"/>}
                                    </button>
                                </div>
                                <div className="col-span-4 md:col-span-2"><input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleLineItemChange(product.id, item.id, 'quantity', parseFloat(e.target.value) || 0)} className={formInputClass}/></div>
                                <div className="col-span-4 md:col-span-2 relative">
                                    <input type="number" placeholder="Price" value={item.unitPrice} onChange={e => handleLineItemChange(product.id, item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className={`${formInputClass} pr-10`} />
                                    <button onClick={() => handleAIPriceSuggestion(product.id, item.id, item.name)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 p-1 rounded-full hover:bg-emerald-100 transition-colors" disabled={aiPriceLoading === item.id} aria-label="Suggest item price">
                                      {aiPriceLoading === item.id ? <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="h-5 w-5"/>}
                                    </button>
                                </div>
                                <div className="col-span-3 md:col-span-2 text-right font-medium pr-2 text-slate-700">{settings.currency}{ (item.quantity * item.unitPrice).toFixed(2)}</div>
                                <div className="col-span-1 text-right">
                                    <button onClick={() => handleRemoveItem(product.id, item.id)} className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50" aria-label="Remove item"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            </div>
                        ))}
                      </div>
                      <button onClick={() => handleAddItem(product.id)} className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-semibold text-sm">Add Material/Service</button>
                  </div>
                )
              })}
              <button onClick={handleAddProduct} className="w-full px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold text-base shadow-sm">Add New Product</button>
            </div>
        </div>

        {/* Sticky Sidebar - Right Column */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 mt-8 lg:mt-0">
            {/* Summary Card */}
            <div className="bg-white shadow-md rounded-xl p-6">
                 <h3 className="text-lg font-bold text-slate-700 mb-4">Summary</h3>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-medium text-slate-800">{settings.currency}{doc.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <label className="text-slate-600">Labour Charge</label>
                        <input type="number" name="labourCharge" value={doc.labourCharge} onChange={handleNumericChange} className={`${formInputClass} w-28 text-right`} />
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <label className="text-slate-600">Discount</label>
                        <input type="number" name="discountAmount" value={doc.discountAmount} onChange={handleNumericChange} className={`${formInputClass} w-28 text-right`} />
                    </div>
                    <div className="border-t border-slate-200 !my-4"></div>
                    <div className="flex justify-between items-center text-xl font-bold text-slate-900">
                        <span>Total</span>
                        <span>{settings.currency}{doc.total.toFixed(2)}</span>
                    </div>
                    {isBill && 'amountPaid' in doc && (
                        <>
                            <div className="flex justify-between items-center gap-4 pt-2">
                               <label className="text-slate-600">Amount Paid</label>
                               <input type="number" name="amountPaid" value={doc.amountPaid} onChange={handleNumericChange} className={`${formInputClass} w-28 text-right`} />
                            </div>
                             <div className="flex justify-between items-center font-bold text-green-600">
                               <span>Balance Due</span>
                               <span>{settings.currency}{(doc.total - doc.amountPaid).toFixed(2)}</span>
                            </div>
                        </>
                    )}
                 </div>
            </div>

            {/* Bill Specific Fields Card */}
            {isBill && 'paymentMethod' in doc && (
                <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-slate-700">Bill Settings</h3>
                    {/* Date moved to main card, keeping payment/status here */}
                    <div>
                         <label className="block text-sm font-semibold text-slate-600 mb-1">Payment Method</label>
                         <select name="paymentMethod" value={doc.paymentMethod} onChange={handleInputChange} className={formInputClass}>
                             {Object.values(PaymentMethod).map(method => <option key={method} value={method}>{method}</option>)}
                         </select>
                    </div>
                    <div>
                         <label className="block text-sm font-semibold text-slate-600 mb-1">Status</label>
                         <select name="status" value={doc.status} onChange={handleInputChange} className={formInputClass}>
                             <option value={DocumentStatus.PAID}>Paid</option>
                             <option value={DocumentStatus.PARTIALLY_PAID}>Partially Paid</option>
                             <option value={DocumentStatus.DUE}>Due</option>
                         </select>
                    </div>
                </div>
            )}
            
            <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
                 <h3 className="text-lg font-bold text-slate-700">Details</h3>
                 <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Notes</label>
                    <textarea name="notes" value={doc.notes} onChange={handleInputChange} rows={3} className={formInputClass} placeholder="Any additional notes..."></textarea>
                 </div>
                 {isBill && 'terms' in doc && (
                     <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Terms & Conditions</label>
                         <textarea name="terms" value={doc.terms} onChange={handleInputChange} rows={3} className={formInputClass}></textarea>
                     </div>
                 )}
            </div>

            {/* Actions Card */}
            <div className="bg-white shadow-md rounded-xl p-6 space-y-3">
                <h3 className="text-lg font-bold text-slate-700 mb-2">Actions</h3>
                 <button onClick={() => onSave(doc)} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg font-semibold text-base capitalize">Save {doc.type}</button>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setShowCustomization(true)} className="w-full px-2 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors shadow-sm font-semibold text-sm flex items-center justify-center gap-1">
                        <AdjustmentsHorizontalIcon className="h-4 w-4"/> Customize
                    </button>
                    <button onClick={() => setShowPreview(true)} className="w-full px-2 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors shadow-sm font-semibold text-sm">Preview</button>
                </div>
                {!isBill && activeDocument && <button onClick={handleConvertToBill} className="w-full px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm font-semibold text-sm">Convert to Bill</button>}
                <div className="flex gap-2 justify-center pt-2 text-sm text-slate-600 font-medium">
                     <button onClick={() => exportAsPdf(EXPORT_ELEMENT_ID)} className="hover:text-emerald-600">PDF</button>
                    <span className="text-slate-300">|</span>
                     <button onClick={() => exportAsImage(EXPORT_ELEMENT_ID)} className="hover:text-emerald-600">Image</button>
                     <span className="text-slate-300">|</span>
                     <button onClick={() => exportAsWord(EXPORT_ELEMENT_ID, `${doc.type}-${doc.number}.doc`)} className="hover:text-emerald-600">Word</button>
                 </div>
            </div>
        </div>
        
        {/* Hidden Printable View for Export - Uses fixed A4 dimensions */}
        <div className="fixed -left-[9999px] top-0">
         <PrintableView id={EXPORT_ELEMENT_ID} doc={doc} settings={settings} />
      </div>
    </div>

    {/* Customization Modal */}
    {showCustomization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Customize Document</h3>
                    <button onClick={() => setShowCustomization(false)} className="text-slate-500 hover:text-slate-800"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* General Toggles */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Details Block</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Show Date</span>
                            <input type="checkbox" checked={doc.preferences.showDate} onChange={(e) => handlePreferenceChange('showDate', e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Show Status</span>
                            <input type="checkbox" checked={doc.preferences.showStatus} onChange={(e) => handlePreferenceChange('showStatus', e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Show Payment Method</span>
                            <input type="checkbox" checked={doc.preferences.showPaymentMethod} onChange={(e) => handlePreferenceChange('showPaymentMethod', e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Show Terms & Conditions</span>
                            <input type="checkbox" checked={doc.preferences.showTerms} onChange={(e) => handlePreferenceChange('showTerms', e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Show Notes</span>
                            <input type="checkbox" checked={doc.preferences.showNotes} onChange={(e) => handlePreferenceChange('showNotes', e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                        </div>
                        <div className="flex items-center justify-between border-t pt-2">
                             <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-800">Show Rates & Amounts</span>
                                <span className="text-xs text-slate-400">Turn off for Delivery Challan</span>
                             </div>
                            <input type="checkbox" checked={doc.preferences.showProductPrice} onChange={(e) => handlePreferenceChange('showProductPrice', e.target.checked)} className="h-5 w-5 text-emerald-600 rounded" />
                        </div>
                    </div>

                    {/* Summary Toggles */}
                    <div className="space-y-3 border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Summary & Total Block</h4>
                             <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                                <input type="checkbox" checked={doc.preferences.showSummary} onChange={(e) => handlePreferenceChange('showSummary', e.target.checked)} />
                                Master Toggle
                            </label>
                        </div>
                        
                        {doc.preferences.showSummary && (
                            <div className="pl-2 space-y-2 border-l-2 border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Show Subtotal</span>
                                    <input type="checkbox" checked={doc.preferences.showSubtotal} onChange={(e) => handlePreferenceChange('showSubtotal', e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Show Labour</span>
                                    <input type="checkbox" checked={doc.preferences.showLabour} onChange={(e) => handlePreferenceChange('showLabour', e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Show Discount</span>
                                    <input type="checkbox" checked={doc.preferences.showDiscount} onChange={(e) => handlePreferenceChange('showDiscount', e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Show Total</span>
                                    <input type="checkbox" checked={doc.preferences.showTotal} onChange={(e) => handlePreferenceChange('showTotal', e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Show Amount Paid</span>
                                    <input type="checkbox" checked={doc.preferences.showAmountPaid} onChange={(e) => handlePreferenceChange('showAmountPaid', e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                                </div>
                                 <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Show Balance Due</span>
                                    <input type="checkbox" checked={doc.preferences.showBalance} onChange={(e) => handlePreferenceChange('showBalance', e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Custom Labels */}
                    <div className="space-y-3 border-t pt-4">
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Custom Labels</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Date Label</label>
                                <input type="text" value={doc.preferences.dateLabel} onChange={(e) => handlePreferenceChange('dateLabel', e.target.value)} className={formInputClass} />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Terms Label</label>
                                <input type="text" value={doc.preferences.termsLabel} onChange={(e) => handlePreferenceChange('termsLabel', e.target.value)} className={formInputClass} />
                            </div>
                             <div>
                                <label className="block text-xs text-slate-500 mb-1">Total Label</label>
                                <input type="text" value={doc.preferences.totalLabel} onChange={(e) => handlePreferenceChange('totalLabel', e.target.value)} className={formInputClass} />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Balance Label</label>
                                <input type="text" value={doc.preferences.balanceLabel} onChange={(e) => handlePreferenceChange('balanceLabel', e.target.value)} className={formInputClass} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-slate-50 text-right">
                    <button onClick={() => setShowCustomization(false)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Done</button>
                </div>
             </div>
        </div>
    )}

    {showPreview && (
        <PrintPreview 
            doc={doc}
            settings={settings}
            onClose={() => setShowPreview(false)}
        />
    )}
    </>
  );
};
