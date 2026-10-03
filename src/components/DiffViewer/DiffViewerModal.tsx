import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, Check, RotateCcw, Edit3 } from 'lucide-react';
import { OptimizeTextResult } from '../../services/api';

interface DiffViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  diffData: OptimizeTextResult | null;
  onApply: (approvedText: string) => void;
  title?: string;
}

export const DiffViewerModal: React.FC<DiffViewerModalProps> = ({
  isOpen,
  onClose,
  diffData,
  onApply,
  title = 'Revisión y Trazabilidad de Redacción con IA',
}) => {
  if (!isOpen || !diffData) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(diffData.proposedText);

  const handleApply = () => {
    onApply(isEditing ? editedText : diffData.proposedText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-neutral-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
              <p className="text-xs text-neutral-500">
                La IA optimiza estilo sin inventar métricas, cargos ni logros no sustentados.
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

        {/* Warning if AI proposal requires user confirmation */}
        {diffData.requiresConfirmation && (
          <div className="mx-6 mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold block text-amber-950 uppercase tracking-wide text-[11px] mb-0.5">
                ⚠️ Propuesta que requiere confirmación expresa
              </span>
              {diffData.confirmationNotes ||
                'La IA sugiere términos clave para alinear con la vacante. Verifique si realmente corresponden a su experiencia real antes de aceptar.'}
            </div>
          </div>
        )}

        {/* Explanation of changes */}
        {diffData.changesExplanation && (
          <div className="px-6 pt-3 text-xs text-neutral-600 flex items-center gap-2">
            <span className="font-medium text-neutral-900">Criterio aplicado:</span>
            <span>{diffData.changesExplanation}</span>
          </div>
        )}

        {/* Comparison grid: ORIGINAL vs PROPUESTA */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
          {/* Original Column */}
          <div className="flex flex-col border border-neutral-200 rounded-xl bg-neutral-50/70 p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <span>Original (Declarado)</span>
              <span className="text-[11px] font-normal text-neutral-400">Sin modificar</span>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap font-mono text-[13px]">
              {diffData.originalText}
            </p>
          </div>

          {/* Proposal Column */}
          <div className="flex flex-col border border-blue-200 rounded-xl bg-blue-50/30 p-4 relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-200 text-xs font-semibold text-blue-900 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Propuesta Optimizada
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1 font-medium underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Vista previa' : 'Editar texto'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={editedText}
                onChange={e => setEditedText(e.target.value)}
                rows={6}
                className="w-full text-sm text-neutral-900 bg-white p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            ) : (
              <p className="text-sm text-neutral-900 leading-relaxed whitespace-pre-wrap font-sans font-medium">
                {editedText}
              </p>
            )}

            {diffData.actionVerbsUsed && diffData.actionVerbsUsed.length > 0 && (
              <div className="mt-3 pt-2 border-t border-blue-100 flex flex-wrap gap-1 text-[11px] text-blue-700">
                <span className="font-semibold text-blue-950">Verbos de acción:</span>
                {diffData.actionVerbsUsed.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Rechazar y mantener original
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Aceptar edición manual' : 'Aceptar propuesta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
