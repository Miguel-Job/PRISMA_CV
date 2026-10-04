import React, { useState } from 'react';
import { MasterProfile, UserAccount } from '../types';
import { Plus, Target, User, FileText, Briefcase, FolderCheck, BarChart2, Shield, LogOut, Key, Copy, Check, ChevronDown } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSimpleMode: boolean;
  onToggleMode: () => void;
  onOpenNewCv: () => void;
  onOpenPrivacy: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  activeCredentials?: { username: string; password: string } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isSimpleMode,
  onToggleMode,
  onOpenNewCv,
  onOpenPrivacy,
  currentUser,
  onLogout,
  activeCredentials,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  const handleCopyCredentials = () => {
    if (!currentUser) return;
    const pass = activeCredentials?.password || '••••••••';
    navigator.clipboard.writeText(`Usuario: ${currentUser.username}\nContraseña: ${pass}`);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  return (
    <>
      {/* Desktop Top Bar Contract: 3 zones */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Wordmark */}
          <button
            type="button"
            onClick={() => onTabChange('home')}
            className="text-lg font-extrabold tracking-tight text-neutral-900 flex items-center gap-2.5 hover:opacity-90 transition-opacity shrink-0"
          >
            <img
              src="/prisma-logo.png"
              alt="PRISMA"
              className="w-8 h-8 object-contain"
            />
            <span className="tracking-tight font-black">PRISMA</span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-600">
            <button
              type="button"
              onClick={() => onTabChange('home')}
              className={`hover:text-neutral-900 transition-colors ${
                activeTab === 'home' ? 'text-neutral-900 underline underline-offset-4' : ''
              }`}
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => onTabChange('profile')}
              className={`hover:text-neutral-900 transition-colors ${
                activeTab === 'profile' ? 'text-neutral-900 underline underline-offset-4' : ''
              }`}
            >
              Mi Perfil Maestro
            </button>
            <button
              type="button"
              onClick={() => onTabChange('cvs')}
              className={`hover:text-neutral-900 transition-colors ${
                activeTab === 'cvs' ? 'text-neutral-900 underline underline-offset-4' : ''
              }`}
            >
              Mis CVs
            </button>
            {!isSimpleMode && (
              <>
                <button
                  type="button"
                  onClick={() => onTabChange('applications')}
                  className={`hover:text-neutral-900 transition-colors ${
                    activeTab === 'applications' ? 'text-neutral-900 underline underline-offset-4' : ''
                  }`}
                >
                  Postulaciones
                </button>
                <button
                  type="button"
                  onClick={() => onTabChange('documents')}
                  className={`hover:text-neutral-900 transition-colors ${
                    activeTab === 'documents' ? 'text-neutral-900 underline underline-offset-4' : ''
                  }`}
                >
                  Expediente
                </button>
                <button
                  type="button"
                  onClick={() => onTabChange('stats')}
                  className={`hover:text-neutral-900 transition-colors ${
                    activeTab === 'stats' ? 'text-neutral-900 underline underline-offset-4' : ''
                  }`}
                >
                  Estadísticas
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Actions (Mode switch, Country, User Profile Menu, and CTA) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Mode Toggle Button */}
            <button
              type="button"
              onClick={onToggleMode}
              title={isSimpleMode ? 'Cambiar a Modo Profesional con expedientes y ATS' : 'Cambiar a Modo Simple'}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>{isSimpleMode ? 'Modo Simple' : 'Modo Profesional'}</span>
            </button>

            {/* Country Selector */}
            <div className="hidden lg:flex items-center gap-1 text-xs font-medium text-neutral-600 bg-neutral-50 px-2 py-1.5 rounded-lg border border-neutral-200">
              <span>🇵🇪 Perú</span>
            </div>

            {/* Privacy Center Icon */}
            <button
              type="button"
              onClick={onOpenPrivacy}
              title="Centro de Privacidad"
              className="p-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={onOpenNewCv}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuevo CV</span>
            </button>

            {/* User Account Popover */}
            {currentUser && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-neutral-800 max-w-[100px] truncate hidden md:inline">
                    {currentUser.username}
                  </span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl p-3 space-y-2.5 z-50 text-xs animate-in fade-in">
                    <div className="pb-2 border-b border-neutral-100">
                      <span className="font-bold text-neutral-900 block truncate">
                        {currentUser.fullName}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono block">
                        @{currentUser.username}
                      </span>
                    </div>

                    {/* Quick credentials copy banner */}
                    <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-neutral-700 flex items-center gap-1">
                          <Key className="w-3 h-3 text-blue-600" />
                          Credenciales de acceso:
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyCredentials}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
                        >
                          {copiedCreds ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedCreds ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                      <div className="font-mono text-[10px] text-neutral-600 bg-white p-1.5 rounded border border-neutral-200/80">
                        <div>user: <strong>{currentUser.username}</strong></div>
                        <div>pass: <strong>{activeCredentials?.password || 'Talento2026!'}</strong></div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full py-1.5 px-2 text-left rounded-lg text-rose-700 hover:bg-rose-50 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Thumb Zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 h-16 grid grid-cols-5 items-center px-1">
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center py-1 ${
            activeTab === 'home' ? 'text-slate-900 font-bold' : 'text-neutral-500'
          }`}
        >
          <span className="text-base">🏠</span>
          <span className="text-[10px] mt-0.5">Inicio</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center py-1 ${
            activeTab === 'profile' ? 'text-slate-900 font-bold' : 'text-neutral-500'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Perfil</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('cvs')}
          className={`flex flex-col items-center justify-center py-1 ${
            activeTab === 'cvs' ? 'text-slate-900 font-bold' : 'text-neutral-500'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Mis CVs</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('applications')}
          className={`flex flex-col items-center justify-center py-1 ${
            activeTab === 'applications' ? 'text-slate-900 font-bold' : 'text-neutral-500'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Postulaciones</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('documents')}
          className={`flex flex-col items-center justify-center py-1 ${
            activeTab === 'documents' ? 'text-slate-900 font-bold' : 'text-neutral-500'
          }`}
        >
          <FolderCheck className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Expediente</span>
        </button>
      </nav>
    </>
  );
};
