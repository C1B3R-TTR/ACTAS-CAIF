import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-end gap-4">
      <div>
        <h1 className="text-5xl font-black tracking-tighter text-white">
          CIAF <span className="text-cyan-500">ACTAS</span>
        </h1>
        <p className="text-gray-400 text-xs uppercase tracking-[0.3em] font-bold mt-2">Sistema de Gestión de Hardware</p>
      </div>
    </header>
  );
};