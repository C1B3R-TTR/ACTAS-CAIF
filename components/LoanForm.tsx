import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { LoanFormData, ImportedContact } from '../types';
import { ExcelIcon } from './icons/ExcelIcon';
import { TrashIcon } from './icons/TrashIcon';
import { db } from '../utils/db';

interface LoanFormProps {
  formData: LoanFormData;
  setFormData: React.Dispatch<React.SetStateAction<LoanFormData>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const departmentSuggestions = [
  "Cartera",
  "Registro y Control",
  "Académica",
  "Mercadeo",
  "Sistemas",
  "Comunicaciones",
  "Financiera",
  "Talento Humano",
  "Contable",
  "Bienestar",
  "Mercadeo y Extension",
  "SAC"
];

const LoanForm: React.FC<LoanFormProps> = ({ formData, setFormData, onGenerate, isLoading }) => {
  const [importedContacts, setImportedContacts] = useState<ImportedContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshContacts = useCallback(async () => {
    const contacts = await db.contacts.toArray();
    setImportedContacts(contacts.sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  useEffect(() => {
    refreshContacts();
  }, [refreshContacts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const newContacts: ImportedContact[] = json
          .map(row => ({ name: String(row[0] || ''), email: String(row[1] || '') }))
          .filter(contact => 
            contact.name.trim() !== '' &&
            contact.email.trim() !== '' &&
            contact.email.includes('@')
          )
          .slice(1);

        if (newContacts.length > 0) {
          await db.contacts.bulkPut(newContacts);
          await refreshContacts();
          setSearchTerm('');
        } else {
          alert("No se encontraron contactos válidos (nombre y correo) en las dos primeras columnas del archivo Excel.");
        }
      } catch (error) {
        console.error("Error al procesar el archivo Excel:", error);
        alert("Hubo un error al procesar el archivo. Asegúrese de que sea un archivo de Excel válido.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleContactClick = (selectedContact: ImportedContact) => {
    setFormData(prev => ({ 
      ...prev, 
      applicantName: selectedContact.name,
      applicantEmail: selectedContact.email,
    }));
  };

  const handleDeleteContact = async (contactToDelete: ImportedContact) => {
    if (contactToDelete.id) {
      await db.contacts.delete(contactToDelete.id);
      await refreshContacts();
    }
  };

  const filteredContacts = useMemo(() =>
    importedContacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [importedContacts, searchTerm]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-400">Detalles del Préstamo</h2>
        <button
          onClick={handleImportClick}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm"
        >
          <ExcelIcon />
          <span>Importar Contactos</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          className="hidden"
          accept=".xlsx, .xls"
        />
      </div>

      <div className="space-y-4">
        {importedContacts.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contactos Guardados</label>
            <input
              type="text"
              placeholder="Buscar contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition mb-2"
            />
            <div className="max-h-48 overflow-y-auto bg-gray-700 border border-gray-600 rounded-md p-2 space-y-2">
              {filteredContacts.length > 0 ? filteredContacts.map((contact) => (
                <div key={contact.id} className="flex justify-between items-center bg-gray-600 p-2 rounded-md hover:bg-gray-500 transition-colors">
                  <button 
                    onClick={() => handleContactClick(contact)}
                    className="text-left flex-grow text-white"
                  >
                    <span className="font-medium">{contact.name}</span>
                    <span className="block text-xs text-gray-400">{contact.email}</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteContact(contact)}
                    className="text-red-400 hover:text-red-600 p-1 rounded-full transition-colors"
                    aria-label={`Eliminar ${contact.name}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              )) : (
                <p className="text-gray-400 text-center p-2">No se encontraron contactos.</p>
              )}
            </div>
          </div>
        )}
        <div>
          <label htmlFor="applicantName" className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo del Solicitante</label>
          <input
            type="text"
            id="applicantName"
            name="applicantName"
            value={formData.applicantName}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            placeholder="Ej: Juan Pérez"
          />
        </div>
        <div>
          <label htmlFor="applicantEmail" className="block text-sm font-medium text-gray-300 mb-1">Correo del Solicitante</label>
          <input
            type="email"
            id="applicantEmail"
            name="applicantEmail"
            value={formData.applicantEmail}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            placeholder="Ej: juan.perez@example.com"
          />
        </div>
        <div>
          <label htmlFor="applicantArea" className="block text-sm font-medium text-gray-300 mb-1">Área del Solicitante</label>
          <input
            type="text"
            id="applicantArea"
            name="applicantArea"
            value={formData.applicantArea}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            placeholder="Ej: Mercadeo"
            list="department-suggestions"
          />
          <datalist id="department-suggestions">
            {departmentSuggestions.map(dep => <option key={dep} value={dep} />)}
          </datalist>
        </div>
        <div>
          <label htmlFor="delivererName" className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo de Quien Entrega</label>
          <input
            type="text"
            id="delivererName"
            name="delivererName"
            value={formData.delivererName}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            placeholder="Ej: Ana García"
          />
        </div>
        <div>
          <label htmlFor="hardwareItems" className="block text-sm font-medium text-gray-300 mb-1">Equipos de Hardware (separados por coma)</label>
          <textarea
            id="hardwareItems"
            name="hardwareItems"
            rows={4}
            value={formData.hardwareItems}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            placeholder="Ej: MacBook Pro 16 pulgadas, Cargador, Magic Mouse"
          ></textarea>
        </div>
      </div>
      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </>
        ) : (
          'Generar Acta'
        )}
      </button>
    </div>
  );
};

export default LoanForm;