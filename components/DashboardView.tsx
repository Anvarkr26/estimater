import React, { useMemo } from 'react';
import { Document, DocumentStatus, SettingsProfile, Bill } from '../types';

interface DashboardViewProps {
  documents: Document[];
  settings: SettingsProfile;
  onEdit: (id: string) => void;
  onCreateNew: () => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform hover:scale-105">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

// Icons for stats
const DocumentTextIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const ReceiptPercentIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l4 4m-4-4l4-4m2 11V9a2 2 0 012-2h2l-3 3m-3-3h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012 2h2l3 3" /></svg>);
const BanknotesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
const ExclamationTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>);

const statusColorMap: Record<DocumentStatus, string> = {
    [DocumentStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [DocumentStatus.FINALIZED]: 'bg-blue-100 text-blue-800',
    [DocumentStatus.DUE]: 'bg-yellow-100 text-yellow-800',
    [DocumentStatus.PARTIALLY_PAID]: 'bg-orange-100 text-orange-800',
    [DocumentStatus.PAID]: 'bg-green-100 text-green-800',
}

export const DashboardView: React.FC<DashboardViewProps> = ({ documents, settings, onEdit, onCreateNew }) => {
    
    const stats = useMemo(() => {
        const bills = documents.filter(d => d.type === 'bill') as Bill[];
        const estimates = documents.filter(d => d.type === 'estimate');

        const totalBilled = bills
            .filter(b => b.status === DocumentStatus.PAID || b.status === DocumentStatus.PARTIALLY_PAID)
            .reduce((sum, b) => sum + b.total, 0);

        const outstandingAmount = bills
            .filter(b => b.status === DocumentStatus.DUE || b.status === DocumentStatus.PARTIALLY_PAID)
            .reduce((sum, b) => sum + (b.total - b.amountPaid), 0);

        return {
            totalBilled,
            outstandingAmount,
            estimateCount: estimates.length,
            billCount: bills.length,
        };
    }, [documents]);

    const recentDocuments = useMemo(() => {
        return [...documents]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [documents]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Billed" value={`${settings.currency}${stats.totalBilled.toFixed(2)}`} icon={<BanknotesIcon />} color="bg-green-100" />
                <StatCard title="Outstanding" value={`${settings.currency}${stats.outstandingAmount.toFixed(2)}`} icon={<ExclamationTriangleIcon />} color="bg-amber-100" />
                <StatCard title="Total Estimates" value={String(stats.estimateCount)} icon={<DocumentTextIcon />} color="bg-emerald-100" />
                <StatCard title="Total Bills" value={String(stats.billCount)} icon={<ReceiptPercentIcon />} color="bg-sky-100" />
            </div>

            {/* Recent Documents & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Documents</h2>
                    <div className="space-y-3">
                        {recentDocuments.length > 0 ? recentDocuments.map(doc => (
                           <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                               <div>
                                   <p className="font-bold text-slate-700">{doc.customerName}</p>
                                   <p className="text-sm text-slate-500">{doc.number} &middot; {new Date(doc.date).toLocaleDateString()}</p>
                               </div>
                               <div className="text-right">
                                    <p className="font-semibold text-slate-800">{settings.currency}{doc.total.toFixed(2)}</p>
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColorMap[doc.status]}`}>
                                        {doc.status}
                                    </span>
                               </div>
                                <button onClick={() => onEdit(doc.id)} className="ml-4 text-emerald-600 hover:text-emerald-700 font-semibold text-sm">View</button>
                           </div>
                        )) : (
                            <p className="text-slate-500 text-center py-8">No recent documents.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        <button onClick={onCreateNew} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg font-semibold text-base">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            <span>Create New</span>
                        </button>
                         <p className="text-sm text-slate-500 text-center">Start a new estimate or bill for a customer.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};