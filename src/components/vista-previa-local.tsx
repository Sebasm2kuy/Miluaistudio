'use client';

/**
 * Vista previa fiel del panel de administración (herramienta local).
 *
 * Renderiza InvitationExperience SIN ConfigProvider: useConfig() cae a la
 * configuración guardada por el panel en este navegador (localStorage) o, si
 * no hay ninguna, a la base de demostración sintética. Es el mismo componente
 * que verán los invitados en la página publicada, no una maqueta aparte.
 *
 * El aviso fijo distingue esta página de una invitación publicada real.
 */

import { History } from 'lucide-react';
import InvitationExperience from '@/components/invitation-experience';

export default function VistaPreviaLocal() {
  return (
    <>
      <InvitationExperience />
      <button
        type="button"
        onClick={() => window.history.back()}
        className="fixed left-3 top-3 z-[9999] inline-flex items-center gap-2 rounded-full border border-[#ded4c8] bg-black/75 px-3 py-2 text-xs font-medium text-white/90 shadow-lg backdrop-blur-md transition hover:border-[#c9bbaa] hover:bg-black/90 sm:left-5 sm:top-5 sm:px-4 sm:py-2.5 sm:text-sm"
        aria-label="Volver al panel de configuración"
      >
        <History size={15} />
        Vista previa local · Volver
      </button>
    </>
  );
}
