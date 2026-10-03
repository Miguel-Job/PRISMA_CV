import React from 'react';
import { EvidenceStatus } from '../types';
import { CheckCircle2, CircleDot, AlertCircle, FileCheck } from 'lucide-react';

interface EvidenceBadgeProps {
  status: EvidenceStatus;
  documentName?: string;
  className?: string;
  showLabel?: boolean;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  status,
  documentName,
  className = '',
  showLabel = true,
}) => {
  if (status === 'verified') {
    return (
      <span
        title={documentName ? `Verificado con documento: ${documentName}` : 'Verificado con documento sustentatorio adjunto'}
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
        {showLabel && <span>Verificado</span>}
        {documentName && (
          <span className="hidden sm:inline text-neutral-400 font-normal">
            (Doc adjunto)
          </span>
        )}
      </span>
    );
  }

  if (status === 'declared') {
    return (
      <span
        title="Declarado por el usuario en su perfil"
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-blue-800 dark:text-blue-300 ${className}`}
      >
        <CircleDot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
        {showLabel && <span>Declarado</span>}
      </span>
    );
  }

  return (
    <span
      title="Pendiente de adjuntar constancia o verificación"
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
      {showLabel && <span>Pendiente de verificación</span>}
    </span>
  );
};
