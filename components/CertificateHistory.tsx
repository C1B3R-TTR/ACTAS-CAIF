import React, { useEffect, useState } from 'react';
import { db } from '../utils/db';
import { CertificateData } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface CertificateHistoryProps {
  onSelect: (cert: CertificateData) => void;
}

const CertificateHistory: React.FC<CertificateHistoryProps> = ({ onSelect }) => {
  const [history, setHistory] = useState<CertificateData[]>([]);

  const loadHistory = async () => {
    const certs = await db.certificates.orderBy('date').reverse().toArray();
    setHistory(certs);
  };

  useEffect(() => {
    loadHistory();
    
    // Escuchar cambios en la base de datos (opcional pero bueno para UX)
    const interval = setInterval(loadHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id?: number) => {
    if (id && confirm('¿Estás seguro de eliminar este registro histórico?')) {
      await db.certificates.delete(id);
      loadHistory();
    }
  };

  if (history.length === 0) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">Historial de Actas</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 uppercase text-[10px] tracking-widest">
              <th className="pb-3 px-2">Folio</th>
              <th className="pb-3 px-2">Funcionario</th>
              <th className="pb-3 px-2">Fecha</th>
              <th className="pb-3 px-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {history.map((cert) => (
              <tr key={cert.id} className="hover:bg-gray-700/50 transition-colors group">
                <td className="py-4 px-2 font-mono text-cyan-500">{cert.folioNumber}</td>
                <td className="py-4 px-2">
                  <div className="font-bold text-white">{cert.applicantName}</div>
                  <div className="text-[10px] text-gray-500">{cert.applicantArea}</div>
                </td>
                <td className="py-4 px-2 text-gray-400">
                  {new Date(cert.date).toLocaleDateString()}
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onSelect(cert)}
                      className="p-2 bg-gray-700 hover:bg-cyan-600 text-white rounded transition-colors"
                      title="Ver / Cargar"
                    >
                      <DownloadIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(cert.id)}
                      className="p-2 bg-gray-700 hover:bg-red-600 text-white rounded transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CertificateHistory;
