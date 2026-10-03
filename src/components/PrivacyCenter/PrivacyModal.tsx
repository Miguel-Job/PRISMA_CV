import React from 'react';
import { X, ShieldCheck, Lock, Globe, Link2, Download, Trash2, Cpu, EyeOff, Check } from 'lucide-react';
import { PrivacySettings, MasterProfile } from '../../types';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  privacySettings: PrivacySettings;
  onUpdatePrivacy: (newSettings: PrivacySettings) => void;
  masterProfile: MasterProfile;
  onResetAllData: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  privacySettings,
  onUpdatePrivacy,
  masterProfile,
  onResetAllData,
}) => {
  if (!isOpen) return null;

  const handleExportDataJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(masterProfile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Expediente_${masterProfile.personalInfo.fullName.replace(/\s+/g, '_')}_Backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-neutral-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-900 text-white rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Centro de Privacidad y Soberanía de Datos
              </h3>
              <p className="text-xs text-neutral-500">
                Tú eres el único dueño de tu información profesional. Nada es público por defecto.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Visibility Selector */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-neutral-700">
              Visibilidad de tu Perfil Web
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onUpdatePrivacy({ ...privacySettings, visibility: 'private' })}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  privacySettings.visibility === 'private'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                }`}
              >
                <Lock className="w-4 h-4 mb-2" />
                <div>
                  <span className="font-bold block">🔒 Privado</span>
                  <span className={`text-[11px] block mt-0.5 ${privacySettings.visibility === 'private' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Solo tú puedes acceder. Nadie en internet puede verlo.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdatePrivacy({ ...privacySettings, visibility: 'link_only' })}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  privacySettings.visibility === 'link_only'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                }`}
              >
                <Link2 className="w-4 h-4 mb-2" />
                <div>
                  <span className="font-bold block">🔗 Solo con enlace</span>
                  <span className={`text-[11px] block mt-0.5 ${privacySettings.visibility === 'link_only' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Visible únicamente para quien tenga el enlace secreto.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdatePrivacy({ ...privacySettings, visibility: 'public' })}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  privacySettings.visibility === 'public'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                }`}
              >
                <Globe className="w-4 h-4 mb-2" />
                <div>
                  <span className="font-bold block">🌐 Público</span>
                  <span className={`text-[11px] block mt-0.5 ${privacySettings.visibility === 'public' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Indexable en portafolios abiertos (si lo deseas).
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* AI Data Protection Switch */}
          <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-neutral-900">
                  Uso de IA con Trazabilidad Estricta
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.allowAiAnalysis}
                onChange={e => onUpdatePrivacy({ ...privacySettings, allowAiAnalysis: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
            <p className="text-neutral-600 text-[11px] leading-relaxed">
              La IA solo se ejecuta bajo tu solicitud explícita (para optimizar redacción o auditar vacantes). <strong>Nunca se utiliza para entrenar modelos públicos con tus datos personales.</strong>
            </p>
          </div>

          {/* Mask Sensitive Data */}
          <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-neutral-900 block">
                Ocultar DNI y teléfono en enlaces compartidos
              </span>
              <p className="text-neutral-500 text-[11px]">
                Muestra solo correo electrónico para evitar spam o llamadas no deseadas.
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.maskContactInfoInPublic}
              onChange={e => onUpdatePrivacy({ ...privacySettings, maskContactInfoInPublic: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </div>

          {/* Data Export & Deletion */}
          <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleExportDataJson}
              className="w-full sm:w-auto px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar Copia Completa (JSON)
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Deseas restaurar los datos al perfil de ejemplo inicial?')) {
                  onResetAllData();
                  onClose();
                }
              }}
              className="w-full sm:w-auto px-4 py-2 text-rose-700 hover:bg-rose-50 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Restablecer datos
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
