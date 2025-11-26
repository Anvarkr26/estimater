
import React from 'react';
import { Document, SettingsProfile, Bill, Product } from '../types';

interface PrintableViewProps {
    doc: Document;
    settings: SettingsProfile;
    id?: string;
}

const getFullProductName = (product: Product): string => {
    let name = product.type === 'Custom' ? (product.customName || 'Custom Product') : product.type;
    
    // Add dimensions if applicable
    const hasDimensions = product.type === 'Silk Cotton Bed' || product.type === 'Sofa Cushion';
    if (hasDimensions && product.height && product.width) {
        name += ` (${product.height} x ${product.width} ${product.unit})`;
    }
    return name;
}

export const PrintableView: React.FC<PrintableViewProps> = ({ doc, settings, id = "printable-view" }) => {
    const isBill = doc.type === 'bill';
    
    // Handle Date: Allow empty or invalid dates to just show nothing or the label
    const dateObj = new Date(doc.date);
    const isValidDate = doc.date && !isNaN(dateObj.getTime());
    const formattedDate = isValidDate ? dateObj.toLocaleDateString('en-GB') : '';

    const balanceDue = isBill ? (doc as Bill).total - (doc as Bill).amountPaid : 0;
    const prefs = doc.preferences;

    // Show QR only if Balance > 0, UPI is set, AND user hasn't hidden the balance or amount paid logic
    const showQRCode = isBill && settings.paymentUPI && balanceDue > 0 && prefs.showBalance && prefs.showAmountPaid;
    
    // Default to emerald-600 if not set
    const themeColor = settings.themeColor || '#059669'; 
    const fontFamily = settings.fontFamily || 'ui-sans-serif, system-ui, sans-serif';

    // Font Size Defaults (fallback)
    const fs = settings.fontSizes || {
        businessName: 30,
        docTitle: 48,
        heading: 12,
        body: 14,
        total: 18
    };

    let qrCodeUrl = '';
    if (showQRCode) {
        const upiData = new URLSearchParams({
            pa: settings.paymentUPI!,
            pn: settings.businessName.substring(0, 25), // Payee name has limits
            am: balanceDue.toFixed(2),
            cu: 'INR', // Standard for UPI
            tn: `Bill #${doc.number}`,
        });
        const upiString = `upi://pay?${upiData.toString()}`;
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=128x128&margin=0&data=${encodeURIComponent(upiString)}`;
    }

    // A4 width at 96 DPI is approx 794px. Height is approx 1123px.
    // We strictly define the width and min-height to simulate a real page.
    return (
        <div 
            id={id} 
            className="w-[794px] min-h-[1123px] bg-white text-gray-800 mx-auto flex flex-col relative box-border leading-normal"
            style={{ fontFamily: fontFamily }}
        >
            <style>
                {`
                    @media print {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                `}
            </style>

            {/* Top Colored Stripe */}
            <div className="h-4 w-full mb-8" style={{ backgroundColor: themeColor }}></div>

            <div className="px-12 pb-12 flex flex-col flex-grow">
                <div className="flex-grow-0">
                    {/* Header Section */}
                    <header className="flex justify-between items-start mb-6">
                        <div className="flex items-start space-x-5">
                            {settings.logo && (
                                <img src={settings.logo} alt="Business Logo" className="h-28 w-auto object-contain max-w-[150px]" />
                            )}
                            <div className="pt-2">
                                <h1 className="font-bold tracking-tight mb-2" style={{ color: themeColor, fontSize: `${fs.businessName}px` }}>{settings.businessName}</h1>
                                <p className="text-gray-600 max-w-xs leading-snug" style={{ fontSize: `${fs.body}px` }}>{settings.address}</p>
                                <p className="text-gray-600 font-medium mt-1" style={{ fontSize: `${fs.body}px` }}>Phone: {settings.phone}</p>
                                {settings.email && <p className="text-gray-600" style={{ fontSize: `${fs.body}px` }}>Email: {settings.email}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="font-bold uppercase tracking-widest opacity-20 text-gray-900" style={{ fontSize: `${fs.docTitle}px` }}>{doc.type}</h2>
                            <div className="mt-[-10px]">
                                <p className="font-bold text-gray-700" style={{ fontSize: `${fs.total}px` }}># {doc.number}</p>
                                {prefs.showDate && formattedDate && (
                                    <p className="font-medium text-gray-500" style={{ fontSize: `${fs.body}px` }}>{prefs.dateLabel || 'Date'}: {formattedDate}</p>
                                )}
                            </div>
                        </div>
                    </header>
                    
                    {/* Divider */}
                    <div className="h-px w-full bg-gray-200 mb-8"></div>

                    {/* Bill To Section */}
                    <section className="flex justify-between items-end mb-10">
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 min-w-[300px]">
                            <h3 className="uppercase font-bold tracking-wider mb-3" style={{ color: themeColor, fontSize: `${fs.heading}px` }}>Bill To</h3>
                            <p className="font-bold text-gray-800" style={{ fontSize: `${fs.total}px` }}>{doc.customerName || 'Guest Customer'}</p>
                            <p className="text-gray-600 mt-1" style={{ fontSize: `${fs.body}px` }}>{doc.customerPhone}</p>
                            {doc.customerAddress && <p className="text-gray-600 max-w-sm leading-snug mt-1" style={{ fontSize: `${fs.body}px` }}>{doc.customerAddress}</p>}
                        </div>
                        
                        <div className="text-right space-y-2">
                             {isBill && prefs.showStatus && (
                                <div>
                                    <p className="font-bold text-gray-400 uppercase tracking-wide" style={{ fontSize: `${fs.heading}px` }}>Status</p>
                                    <span 
                                        className={`inline-block px-3 py-1 rounded mt-1 font-bold border ${doc.status === 'Paid' ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                                        style={{ fontSize: `${fs.body}px` }}
                                    >
                                        {doc.status}
                                    </span>
                                </div>
                             )}
                             {isBill && prefs.showPaymentMethod && (doc as Bill).paymentMethod && (
                                 <div>
                                    <p className="font-bold text-gray-400 uppercase tracking-wide" style={{ fontSize: `${fs.heading}px` }}>Payment</p>
                                    <p className="font-medium text-gray-700 mt-1" style={{ fontSize: `${fs.body}px` }}>{(doc as Bill).paymentMethod}</p>
                                 </div>
                             )}
                        </div>
                    </section>

                    {/* Items Table Section */}
                    <section className="mb-8">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr style={{ backgroundColor: themeColor, color: '#ffffff' }}>
                                    <th style={{ fontSize: `${fs.heading}px` }} className={`py-3 px-4 font-bold uppercase ${prefs.showProductPrice ? 'w-5/12' : 'w-10/12'}`}>Description</th>
                                    <th style={{ fontSize: `${fs.heading}px` }} className="py-3 px-4 font-bold uppercase text-center w-2/12">Qty</th>
                                    {prefs.showProductPrice && (
                                        <>
                                            <th style={{ fontSize: `${fs.heading}px` }} className="py-3 px-4 font-bold uppercase text-right w-2/12">Rate</th>
                                            <th style={{ fontSize: `${fs.heading}px` }} className="py-3 px-4 font-bold uppercase text-right w-3/12">Amount</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {doc.products.map((product, pIndex) => {
                                    const showBasePrice = (product.unitPrice || 0) > 0;
                                    const baseName = getFullProductName(product);
                                    const headerName = showBasePrice ? baseName : (product.quantity > 1 ? `${product.quantity} x ${baseName}` : baseName);

                                    return (
                                    <React.Fragment key={product.id}>
                                        {/* Product Header / Base Price Row */}
                                        <tr className="border-b border-gray-100 last:border-0 bg-gray-50/50">
                                            <td 
                                                colSpan={showBasePrice ? 1 : (prefs.showProductPrice ? 4 : 2)} 
                                                className={`py-3 px-4 font-bold text-gray-900`}
                                                style={{ fontSize: `${fs.body}px` }}
                                            >
                                                {headerName}
                                            </td>
                                            {showBasePrice && (
                                                <>
                                                    <td className="py-3 px-4 text-center" style={{ fontSize: `${fs.body}px` }}>{product.quantity}</td>
                                                    {prefs.showProductPrice && (
                                                        <>
                                                            <td className="py-3 px-4 text-right" style={{ fontSize: `${fs.body}px` }}>{settings.currency}{product.unitPrice?.toFixed(2)}</td>
                                                            <td className="py-3 px-4 text-right font-semibold" style={{ fontSize: `${fs.body}px` }}>{settings.currency}{((product.unitPrice || 0) * product.quantity).toFixed(2)}</td>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </tr>

                                        {/* Line Items */}
                                        {product.lineItems.map(item => {
                                            const totalItemQty = item.quantity * product.quantity;
                                            const totalItemCost = totalItemQty * item.unitPrice;
                                            
                                            return (
                                                <tr key={item.id} className="border-b border-gray-100">
                                                    <td className="py-2 px-4 pl-8 text-gray-600 flex items-center" style={{ fontSize: `${fs.body}px` }}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-3"></span>
                                                        {item.name}
                                                    </td>
                                                    <td className="py-2 px-4 text-center text-gray-500" style={{ fontSize: `${fs.body}px` }}>
                                                        {totalItemQty}
                                                    </td>
                                                    {prefs.showProductPrice && (
                                                        <>
                                                            <td className="py-2 px-4 text-right text-gray-500" style={{ fontSize: `${fs.body}px` }}>
                                                                {settings.currency}{item.unitPrice.toFixed(2)}
                                                            </td>
                                                            <td className="py-2 px-4 text-right text-gray-700" style={{ fontSize: `${fs.body}px` }}>
                                                                {settings.currency}{totalItemCost.toFixed(2)}
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                )})}
                            </tbody>
                        </table>
                    </section>
                </div>

                {/* Spacer to push footer to bottom */}
                <div className="flex-grow"></div>

                <div className="flex-grow-0 break-inside-avoid">
                    {/* Totals Section */}
                    {prefs.showSummary && (
                        <section className="flex justify-between items-start pt-6 mb-8 border-t border-gray-100">
                            <div className="flex-1 mr-8">
                                {showQRCode && (
                                    <div className="inline-block text-center bg-white border border-gray-200 p-2 rounded-lg">
                                        <img src={qrCodeUrl} alt="Payment QR Code" className="w-24 h-24 mb-1" />
                                        <p className="font-bold uppercase text-gray-500 tracking-wide" style={{ fontSize: '10px' }}>Scan to Pay</p>
                                    </div>
                                )}
                            </div>

                            <div className="w-5/12">
                                <div className="space-y-2">
                                    {prefs.showSubtotal && (
                                        <div className="flex justify-between text-gray-600 px-2" style={{ fontSize: `${fs.body}px` }}>
                                            <span className="font-medium">{prefs.subtotalLabel || 'Subtotal'}</span>
                                            <span>{settings.currency}{doc.subtotal.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {prefs.showLabour && doc.labourCharge > 0 &&
                                        <div className="flex justify-between text-gray-600 px-2" style={{ fontSize: `${fs.body}px` }}>
                                            <span className="font-medium">Labour Charge</span>
                                            <span>{settings.currency}{doc.labourCharge.toFixed(2)}</span>
                                        </div>
                                    }
                                    {prefs.showDiscount && doc.discountAmount > 0 &&
                                        <div className="flex justify-between text-red-500 px-2" style={{ fontSize: `${fs.body}px` }}>
                                            <span className="font-medium">Discount</span>
                                            <span>-{settings.currency}{doc.discountAmount.toFixed(2)}</span>
                                        </div>
                                    }
                                    
                                    {/* Total Block */}
                                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-100">
                                        {prefs.showTotal && (
                                            <div className="flex justify-between p-3 font-bold" style={{ backgroundColor: `${themeColor}15`, color: themeColor, fontSize: `${fs.total}px` }}>
                                                <span>{prefs.totalLabel || 'Total'}</span>
                                                <span>{settings.currency}{doc.total.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {isBill && 'amountPaid' in doc && (
                                            <div className="bg-gray-50 p-3 space-y-2 border-t border-gray-100">
                                                {prefs.showAmountPaid && (
                                                    <div className="flex justify-between text-gray-600 uppercase font-semibold tracking-wider" style={{ fontSize: `${fs.heading}px` }}>
                                                        <span>Amount Paid</span>
                                                        <span>{settings.currency}{doc.amountPaid.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {prefs.showBalance && (
                                                    <div className="flex justify-between text-gray-800 font-bold" style={{ fontSize: `${fs.total}px` }}>
                                                        <span>{prefs.balanceLabel || 'Balance Due'}</span>
                                                        <span>{settings.currency}{(doc.total - doc.amountPaid).toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Footer Section */}
                    <footer className="mt-4 pt-6 text-gray-500" style={{ borderTop: `2px solid ${themeColor}` }}>
                        <div className="grid grid-cols-2 gap-8">
                             <div>
                                {(isBill && 'terms' in doc && doc.terms && prefs.showTerms) ? (
                                    <>
                                        <h4 className="font-bold mb-2 uppercase tracking-wide" style={{ color: themeColor, fontSize: `${fs.heading}px` }}>{prefs.termsLabel || 'Terms & Conditions'}</h4>
                                        <p className="whitespace-pre-wrap leading-relaxed" style={{ fontSize: `${fs.body - 2}px` }}>{doc.terms}</p>
                                    </>
                                ) : (
                                    (prefs.showTerms && !isBill) ? <p className="italic" style={{ fontSize: `${fs.body - 2}px` }}>Thank you for your business!</p> : null
                                )}
                            </div>
                            {doc.notes && prefs.showNotes &&
                                <div>
                                    <h4 className="font-bold mb-2 uppercase tracking-wide" style={{ color: themeColor, fontSize: `${fs.heading}px` }}>{prefs.notesLabel || 'Notes'}</h4>
                                    <p className="whitespace-pre-wrap leading-relaxed" style={{ fontSize: `${fs.body - 2}px` }}>{doc.notes}</p>
                                </div>
                            }
                        </div>
                        <div className="mt-8 text-center text-gray-400 uppercase tracking-widest" style={{ fontSize: '10px' }}>
                            Generated by {settings.businessName}
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};
