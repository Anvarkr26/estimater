import React, { useState, useMemo } from 'react';
import { Document, DocumentStatus, SettingsProfile } from '../types';

interface HistoryViewProps {
  documents: Document[];
  settings: SettingsProfile;
  onEdit: (id: string) => void;
  onDelete: (id:string) => void;
}

const statusColorMap: Record<DocumentStatus, string> = {
    [DocumentStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [DocumentStatus.FINALIZED]: 'bg-blue-100 text-blue-800',
    [DocumentStatus.DUE]: 'bg-yellow-100 text-yellow-800',
    [DocumentStatus.PARTIALLY_PAID]: 'bg-orange-100 text-orange-800',
    [DocumentStatus.PAID]: 'bg-green-100 text-green-800',
}

export const HistoryView: React.FC<HistoryViewProps> = ({ documents, settings, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    
    const sortedDocuments = useMemo(() => {
        return [...documents].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }, [documents]);

    const filteredDocuments = useMemo(() => {
        return sortedDocuments.filter(doc => {
            const searchMatch = searchTerm === '' ||
                doc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.number.toLowerCase().includes(searchTerm.toLowerCase());

            const statusMatch = filterStatus === 'all' || doc.status === filterStatus;
            const typeMatch = filterType === 'all' || doc.type === filterType;

            return searchMatch && statusMatch && typeMatch;
        });
    }, [sortedDocuments, searchTerm, filterStatus, filterType]);
    
    const formInputClass = "w-full bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm";


    return (
        <div className="bg-white shadow-md rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">History</h2>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by name or number..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={formInputClass}
                />
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className={formInputClass}>
                    <option value="all">All Types</option>
                    <option value="estimate">Estimates</option>
                    <option value="bill">Bills</option>
                </select>
                 <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={formInputClass}>
                    <option value="all">All Statuses</option>
                    {Object.values(DocumentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            
            {/* List */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b-2 border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4 font-semibold">Type</th>
                            <th className="p-4 font-semibold">Number</th>
                            <th className="p-4 font-semibold">Customer</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Total</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredDocuments.map(doc => (
                            <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 capitalize text-slate-700">{doc.type}</td>
                                <td className="p-4 font-mono text-slate-500">{doc.number}</td>
                                <td className="p-4 text-slate-800 font-medium">{doc.customerName}</td>
                                <td className="p-4 text-slate-600">{new Date(doc.date).toLocaleDateString()}</td>
                                <td className="p-4 font-medium text-slate-800">{settings.currency}{doc.total.toFixed(2)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColorMap[doc.status]}`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-4">
                                    <button onClick={() => onEdit(doc.id)} className="text-emerald-600 hover:underline font-medium">Edit</button>
                                    <button onClick={() => onDelete(doc.id)} className="text-red-500 hover:underline font-medium">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredDocuments.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>No documents found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};