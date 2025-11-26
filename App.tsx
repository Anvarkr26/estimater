
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { EstimateView } from './components/EstimateView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { View, Estimate, Bill, SettingsProfile, Document } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [documents, setDocuments] = useLocalStorage<Document[]>('documents', []);
  const [settings, setSettings] = useLocalStorage<SettingsProfile>('settings', {
    businessName: 'BASHA BED MART',
    address: 'No.44, Villiyanur Main Road, Moolakulam, Near Rina Mahal, Puducherry-10.',
    phone: '99422 23545',
    email: 'bashabedmart@gmail.com',
    logo: '',
    currency: '₹',
    defaultTerms: 'Thank you for your business!',
    paymentUPI: '',
    themeColor: '#059669', // Emerald 600
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    fontSizes: {
      businessName: 30,
      docTitle: 48,
      heading: 12,
      body: 14,
      total: 18
    }
  });
  
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const getNextDocNumber = useCallback((type: 'estimate' | 'bill') => {
    const docsOfType = documents.filter(d => d.type === type);
    if (docsOfType.length === 0) return 1;
    const maxNumber = Math.max(...docsOfType.map(d => parseInt(d.number.toString().replace(/^\D+/g, '') || '0')));
    return maxNumber + 1;
  }, [documents]);

  const handleSaveDocument = (doc: Estimate | Bill) => {
    setDocuments(prevDocs => {
      const existingIndex = prevDocs.findIndex(d => d.id === doc.id);
      if (existingIndex > -1) {
        const updatedDocs = [...prevDocs];
        updatedDocs[existingIndex] = doc;
        return updatedDocs;
      }
      return [...prevDocs, doc];
    });
    setActiveDocumentId(null);
    setView(View.HISTORY);
  };
  
  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
        setDocuments(docs => docs.filter(d => d.id !== id));
    }
  };

  const handleEditDocument = (id: string) => {
    setActiveDocumentId(id);
    setView(View.ESTIMATE);
  };
  
  const handleCreateNew = () => {
    setActiveDocumentId(null);
    setView(View.ESTIMATE);
  };

  const activeDocument = documents.find(d => d.id === activeDocumentId) || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Header settings={settings} currentView={view} setView={setView} onCreateNew={handleCreateNew} />
      <main className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {view === View.DASHBOARD && (
            <DashboardView 
              documents={documents}
              onEdit={handleEditDocument}
              onCreateNew={handleCreateNew}
              settings={settings}
            />
          )}
          {view === View.ESTIMATE && (
            <EstimateView 
              key={activeDocumentId || 'new'} 
              activeDocument={activeDocument} 
              onSave={handleSaveDocument} 
              settings={settings}
              getNextDocNumber={getNextDocNumber}
            />
          )}
          {view === View.HISTORY && (
            <HistoryView 
              documents={documents}
              settings={settings}
              onEdit={handleEditDocument}
              onDelete={handleDeleteDocument}
            />
          )}
          {view === View.SETTINGS && (
            <SettingsView 
              settings={settings} 
              onSave={setSettings} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
