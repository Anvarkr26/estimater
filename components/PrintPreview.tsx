
import React, { useState, useEffect } from 'react';
import { Document, SettingsProfile } from '../types';
import { exportAsImage, getCanvasAsFile } from '../utils/exportUtils';
import { PrintableView } from './PrintableView';

interface PrintPreviewProps {
    doc: Document;
    settings: SettingsProfile;
    onClose: () => void;
}

const ArrowDownTrayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.888-.001 2.225.651 4.315 1.731 6.086l.001.004 4.971 4.971zm-5.421 1.424l.004.004 4.195-1.102-3.883 3.883-1.018-1.018.004.004zm2.148-3.355l.233.136c.078.046.15.098.232.136l.136.078c.082.038.15.098.232.136l.136.078c.082.038.15.098.232.136l.136.078c.082.038.15.098.232.136l.136.078c.082.038.15.098.232.136l.136.078c.082.038.15.098.232.136l.136.078c.082.038.15.098.232.136l.136.078c.082.038.15.098.232.136l.136.078c.082.038.15.098.232.136l.136.078c.082.038.15.098.232.136l.136.078c.082.038.15.098.232.136l.136.078c.082.038.15.098.232.136l.136.0-4.701-4.701zM12.001 2.101L12 2.102c5.461 0 9.888 4.427 9.888 9.888 0 5.461-4.427 9.888-9.888 9.888-1.983 0-3.896-.589-5.57-1.66L2.102 22l1.684-6.321c-1.121-1.754-1.71-3.818-1.709-5.941.001-5.461 4.428-9.888 9.888-9.888zm0 1.636c-4.553 0-8.252 3.699-8.252 8.252 0 1.93.682 3.73 1.84 5.211l.123.187-1.165 4.372 4.475-1.173.178.107c1.405.845 3.02 1.309 4.701 1.309 4.553 0 8.252-3.699 8.252-8.252 0-4.553-3.699-8.252-8.252-8.252zm4.332 9.829c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112s-.58.729-.711.879-.262.168-.486.056c-.225-.113-.944-.349-1.8-.925-.667-.449-1.112-1.002-1.241-1.17s-.13-.261-.019-.41.225-.262.336-.354c.112-.091.149-.15.224-.261.075-.112.038-.205-.019-.317s-.504-1.21-.692-1.655c-.187-.445-.375-.383-.504-.39-.129-.007-.278-.007-.428-.007s-.392.056-.6.317c-.206.262-.789.776-.789 1.891s.809 2.205.921 2.354c.112.15 1.582 2.415 3.832 3.387.536.231.954.368 1.282.474.579.187 1.115.161 1.523.098.452-.068 1.327-.542 1.514-1.066s.187-.991.131-1.066c-.056-.075-.205-.112-.429-.225z" />
    </svg>
);

export const PrintPreview: React.FC<PrintPreviewProps> = ({ doc, settings, onClose }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [isShareApiSupported, setIsShareApiSupported] = useState(false);

    useEffect(() => {
        if (navigator.share) {
            setIsShareApiSupported(true);
        }
    }, []);
    
    // The ID must match the ID passed to PrintableView below
    const PREVIEW_ID = "print-preview-content";

    const handleSaveAsImage = () => {
        exportAsImage(PREVIEW_ID);
    };

    const handleSendToWhatsApp = async () => {
        if (!doc.customerPhone) {
            alert('Please add a customer phone number to the document first.');
            return;
        }

        setIsSharing(true);
        try {
            const imageFile = await getCanvasAsFile(PREVIEW_ID, `${doc.type}-${doc.number}.png`);
            if (!imageFile) {
                alert('Could not generate the image. Please try again.');
                return;
            }

            const shareData = {
                files: [imageFile],
                title: `${doc.type} #${doc.number}`,
                text: `Hi ${doc.customerName || ''},\n\nHere is your ${doc.type} from ${settings.businessName}.\nTotal: ${settings.currency}${doc.total.toFixed(2)}`,
            };
            
            if (navigator.canShare && navigator.canShare(shareData)) {
                 await navigator.share(shareData);
            } else {
                alert("Sharing this file is not supported on your device/browser.");
            }

        } catch (error) {
            console.error("WhatsApp share failed:", error);
            if (!(error instanceof DOMException && error.name === 'AbortError')) {
                alert('An error occurred while trying to share.');
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-start p-4 sm:p-6 md:p-8 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-5xl my-4 relative animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="p-4 bg-white rounded-t-xl border-b flex flex-wrap justify-between items-center gap-4 sticky top-0 z-10 flex-shrink-0">
                     <h3 className="text-lg font-bold text-slate-700">Preview</h3>
                     <div className="flex flex-wrap items-center justify-end gap-2">
                         {isShareApiSupported && (
                            <button 
                                onClick={handleSendToWhatsApp} 
                                disabled={isSharing}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm font-semibold text-sm disabled:bg-green-300 disabled:cursor-wait"
                            >
                                {isSharing ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <WhatsAppIcon className="h-5 w-5"/>
                                )}
                                <span>Send via WhatsApp</span>
                            </button>
                         )}
                         <button onClick={handleSaveAsImage} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-semibold text-sm">
                            <ArrowDownTrayIcon className="h-5 w-5"/>
                            <span>Save as Image</span>
                         </button>
                         <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors" aria-label="Close preview">
                             <XMarkIcon className="h-6 w-6" />
                         </button>
                     </div>
                </div>

                <div className="p-4 md:p-8 overflow-auto flex-grow bg-slate-500/50">
                     {/* 
                         We render the PrintableView here. 
                         The container allows horizontal scrolling if the view is wider than screen (A4 is ~800px)
                     */}
                     <div className="inline-block min-w-min shadow-2xl bg-white mx-auto">
                        <PrintableView id={PREVIEW_ID} doc={doc} settings={settings} />
                     </div>
                </div>
            </div>
        </div>
    );
};
