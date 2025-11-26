
import React, { useState } from 'react';
import { SettingsProfile } from '../types';

interface SettingsViewProps {
  settings: SettingsProfile;
  onSave: (settings: SettingsProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<SettingsProfile>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalSettings(s => ({ ...s, [name]: value }));
  };

  const handleFontSizeChange = (key: keyof SettingsProfile['fontSizes'], value: number) => {
    setLocalSettings(s => ({
      ...s,
      fontSizes: {
        ...s.fontSizes,
        [key]: value
      }
    }));
  };
  
  const handleSave = () => {
    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setLocalSettings(s => ({...s, logo: reader.result as string}));
          };
          reader.readAsDataURL(file);
      }
  };
  
  const formInputClass = "w-full bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm p-2";

  return (
    <div className="bg-white shadow-md rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">Settings</h2>
      
      <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Company Details */}
          <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700">Company Details</h3>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Business Name</label>
                <input type="text" name="businessName" value={localSettings.businessName} onChange={handleInputChange} className={formInputClass}/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Address</label>
                <textarea name="address" value={localSettings.address} onChange={handleInputChange} rows={3} className={formInputClass}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Phone</label>
                    <input type="tel" name="phone" value={localSettings.phone} onChange={handleInputChange} className={formInputClass}/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
                    <input type="email" name="email" value={localSettings.email} onChange={handleInputChange} className={formInputClass}/>
                  </div>
              </div>
               <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Business Logo</label>
                <div className="mt-1 flex items-center space-x-4">
                    {localSettings.logo && <img src={localSettings.logo} alt="Business Logo" className="h-16 w-16 object-contain rounded-md bg-slate-100" />}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"/>
                </div>
               </div>
          </div>

          <hr className="border-slate-200" />

          {/* Visual Customization */}
          <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700">Visual Customization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Theme Color</label>
                      <div className="flex items-center space-x-3">
                          <input 
                            type="color" 
                            name="themeColor" 
                            value={localSettings.themeColor || '#059669'} 
                            onChange={handleInputChange} 
                            className="h-10 w-20 rounded border border-slate-300 cursor-pointer"
                          />
                          <span className="text-sm text-slate-500">{localSettings.themeColor}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Primary color for headers, accents, and borders.</p>
                   </div>
                   <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Font Style</label>
                      <select name="fontFamily" value={localSettings.fontFamily} onChange={handleInputChange} className={formInputClass}>
                          <option value="ui-sans-serif, system-ui, sans-serif">Modern Sans (Default)</option>
                          <option value="'Times New Roman', Times, serif">Classic Serif</option>
                          <option value="'Courier New', Courier, monospace">Typewriter Mono</option>
                          <option value="Georgia, serif">Elegant Georgia</option>
                          <option value="Verdana, Geneva, sans-serif">Clean Verdana</option>
                      </select>
                   </div>
              </div>
          </div>

           <hr className="border-slate-200" />
           
           {/* Font Size Customization */}
           <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700">Typography Sizing (px)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Business Name</label>
                    <input 
                        type="number" 
                        value={localSettings.fontSizes?.businessName || 30} 
                        onChange={(e) => handleFontSizeChange('businessName', parseInt(e.target.value))} 
                        className={formInputClass}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Doc Title (e.g. ESTIMATE)</label>
                    <input 
                        type="number" 
                        value={localSettings.fontSizes?.docTitle || 48} 
                        onChange={(e) => handleFontSizeChange('docTitle', parseInt(e.target.value))} 
                        className={formInputClass}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Section Headers</label>
                    <input 
                        type="number" 
                        value={localSettings.fontSizes?.heading || 12} 
                        onChange={(e) => handleFontSizeChange('heading', parseInt(e.target.value))} 
                        className={formInputClass}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Body Text</label>
                    <input 
                        type="number" 
                        value={localSettings.fontSizes?.body || 14} 
                        onChange={(e) => handleFontSizeChange('body', parseInt(e.target.value))} 
                        className={formInputClass}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Grand Total</label>
                    <input 
                        type="number" 
                        value={localSettings.fontSizes?.total || 18} 
                        onChange={(e) => handleFontSizeChange('total', parseInt(e.target.value))} 
                        className={formInputClass}
                    />
                 </div>
              </div>
           </div>

           <hr className="border-slate-200" />

           {/* Payment & Terms */}
           <div className="space-y-4">
               <h3 className="text-lg font-semibold text-slate-700">Payment & Terms</h3>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Currency Symbol</label>
                <input type="text" name="currency" value={localSettings.currency} onChange={handleInputChange} className={`${formInputClass} w-24`}/>
              </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Payment UPI ID (for QR Code)</label>
                  <input type="text" name="paymentUPI" value={localSettings.paymentUPI || ''} onChange={handleInputChange} className={formInputClass} placeholder="your-upi-id@okhdfcbank" />
                  <p className="text-xs text-slate-500 mt-1">Enter your UPI ID to show a payment QR code on bills.</p>
               </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Default Terms & Conditions</label>
                <textarea name="defaultTerms" value={localSettings.defaultTerms} onChange={handleInputChange} rows={3} className={formInputClass}/>
              </div>
           </div>

          <div className="pt-4 flex justify-end items-center gap-4">
            {isSaved && <span className="text-green-600 text-sm">Settings saved!</span>}
            <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg font-semibold text-sm">
                Save Settings
            </button>
          </div>
      </div>
    </div>
  );
};
