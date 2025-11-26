
import React, { useState } from 'react';
import { SettingsProfile, View } from '../types';

interface HeaderProps {
  settings: SettingsProfile;
  currentView: View;
  setView: (view: View) => void;
  onCreateNew: () => void;
}

const NavButton: React.FC<{
  label: string;
  Icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  themeColor?: string;
}> = ({ label, Icon, isActive, onClick, themeColor }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-opacity-10'
        : 'text-slate-500 hover:bg-slate-100'
    }`}
    style={isActive ? { color: themeColor, backgroundColor: `${themeColor}15` } : {}}
    aria-current={isActive ? 'page' : undefined}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </button>
);

const MobileNavButton: React.FC<{
  label: string;
  Icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  themeColor?: string;
}> = ({ label, Icon, isActive, onClick, themeColor }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full space-x-3 px-4 py-3 rounded-lg text-base font-semibold transition-colors ${
      isActive
        ? 'bg-opacity-10'
        : 'text-slate-600 hover:bg-slate-100'
    }`}
     style={isActive ? { color: themeColor, backgroundColor: `${themeColor}20` } : {}}
     aria-current={isActive ? 'page' : undefined}
  >
    <Icon className="h-6 w-6" />
    <span>{label}</span>
  </button>
);


// Icons
const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
    </svg>
);
const DocumentPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);
const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
const Cog6ToothIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-.952l2.176.42a1.125 1.125 0 0 1 .97 1.257l-.496 2.547a1.125 1.125 0 0 1-1.257.97l-2.176-.42a1.125 1.125 0 0 1-.952-1.11l.496-2.547ZM14.25 4.5l.496-2.547a1.125 1.125 0 0 1 1.257-.97l2.176.42a1.125 1.125 0 0 1 .97 1.257l-.496 2.547a1.125 1.125 0 0 1-1.257.97l-2.176-.42a1.125 1.125 0 0 1-.952-1.11Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 9.375c.09-.542.56-1.007 1.11-.952l2.176.42a1.125 1.125 0 0 1 .97 1.257l-.496 2.547a1.125 1.125 0 0 1-1.257.97l-2.176-.42a1.125 1.125 0 0 1-.952-1.11l.496-2.547ZM14.25 9.75l.496-2.547a1.125 1.125 0 0 1 1.257-.97l2.176.42a1.125 1.125 0 0 1 .97 1.257l-.496 2.547a1.125 1.125 0 0 1-1.257.97l-2.176-.42a1.125 1.125 0 0 1-.952-1.11Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 14.812c.09-.542.56-1.007 1.11-.952l2.176.42a1.125 1.125 0 0 1 .97 1.257l-.496 2.547a1.125 1.125 0 0 1-1.257.97l-2.176-.42a1.125 1.125 0 0 1-.952-1.11l.496-2.547ZM14.25 15.188l.496-2.547a1.125 1.125 0 0 1 1.257-.97l2.176.42a1.125 1.125 0 0 1 .97 1.257l-.496 2.547a1.125 1.125 0 0 1-1.257.97l-2.176-.42a1.125 1.125 0 0 1-.952-1.11Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.875 3.75h14.25c.621 0 1.125.504 1.125 1.125v14.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125V4.875c0-.621.504-1.125 1.125-1.125Z" />
    </svg>
);
const Bars3Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ settings, currentView, setView, onCreateNew }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const themeColor = settings.themeColor || '#059669';

  const handleMobileLinkClick = (view: View) => {
    setView(view);
    setIsMenuOpen(false);
  };

  const handleMobileCreateNewClick = () => {
      onCreateNew();
      setIsMenuOpen(false);
  }

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              {settings.logo && (
                <img src={settings.logo} alt={`${settings.businessName} logo`} className="h-12 w-auto object-contain" />
              )}
              <div>
                  <h1 className="text-xl font-bold" style={{ color: themeColor }}>{settings.businessName}</h1>
                  <p className="text-xs text-slate-500 hidden sm:block">
                      {settings.address} &middot; {settings.phone}
                  </p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <NavButton 
                label="Dashboard"
                Icon={HomeIcon}
                isActive={currentView === View.DASHBOARD}
                onClick={() => setView(View.DASHBOARD)}
                themeColor={themeColor}
              />
              <NavButton
                label="History"
                Icon={ClockIcon}
                isActive={currentView === View.HISTORY}
                onClick={() => setView(View.HISTORY)}
                themeColor={themeColor}
              />
              <NavButton 
                label="Editor"
                Icon={DocumentPlusIcon}
                isActive={currentView === View.ESTIMATE}
                onClick={onCreateNew}
                themeColor={themeColor}
              />
              <NavButton
                label="Settings"
                Icon={Cog6ToothIcon}
                isActive={currentView === View.SETTINGS}
                onClick={() => setView(View.SETTINGS)}
                themeColor={themeColor}
              />
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-md text-slate-500 hover:bg-slate-100" aria-label="Open menu">
                  <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
          
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-lg p-4 animate-slide-in-left">
              <div className="flex justify-between items-center mb-8">
                  <h2 className="font-bold text-lg text-slate-800">Menu</h2>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-slate-100" aria-label="Close menu">
                      <XMarkIcon className="h-6 w-6 text-slate-500" />
                  </button>
              </div>
              <nav className="flex flex-col space-y-2">
                 <MobileNavButton 
                    label="Dashboard"
                    Icon={HomeIcon}
                    isActive={currentView === View.DASHBOARD}
                    onClick={() => handleMobileLinkClick(View.DASHBOARD)}
                    themeColor={themeColor}
                  />
                  <MobileNavButton
                    label="History"
                    Icon={ClockIcon}
                    isActive={currentView === View.HISTORY}
                    onClick={() => handleMobileLinkClick(View.HISTORY)}
                    themeColor={themeColor}
                  />
                  <MobileNavButton 
                    label="Editor"
                    Icon={DocumentPlusIcon}
                    isActive={currentView === View.ESTIMATE}
                    onClick={handleMobileCreateNewClick}
                    themeColor={themeColor}
                  />
                  <MobileNavButton
                    label="Settings"
                    Icon={Cog6ToothIcon}
                    isActive={currentView === View.SETTINGS}
                    onClick={() => handleMobileLinkClick(View.SETTINGS)}
                    themeColor={themeColor}
                  />
              </nav>
          </div>
        </div>
      )}
    </>
  );
};
