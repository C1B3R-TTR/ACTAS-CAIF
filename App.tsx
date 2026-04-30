import React, { useState, useCallback, useMemo } from 'react';
import { LoanFormData, CertificateData } from './types';
import { generateCertificateText } from './services/geminiService';
import LoanForm from './components/LoanForm';
import CertificatePreview from './components/CertificatePreview';
import CertificateHistory from './components/CertificateHistory';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { db } from './utils/db';

const App: React.FC = () => {
  const [formData, setFormData] = useState<LoanFormData>({
    applicantName: '',
    applicantArea: '',
    delivererName: 'IT Department',
    hardwareItems: '',
    applicantEmail: '',
  });

  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const folioNumber = useMemo(() => {
    if (certificateData) return certificateData.folioNumber;
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${dateStr}-${randomStr}`;
  }, [certificateData]);

  const handleGenerateCertificate = useCallback(async () => {
    if (!formData.applicantName || !formData.hardwareItems || !formData.applicantArea) {
      setToast({ message: "El nombre, área del solicitante y los equipos son obligatorios.", type: 'error' });
      return;
    }
    setIsLoading(true);
    setToast(null);
    try {
      const agreementText = await generateCertificateText(formData.hardwareItems);
      const newCertificate: CertificateData = {
        ...formData,
        agreementText,
        folioNumber: folioNumber,
        date: new Date(),
      };
      
      // Guardar en la base de datos local
      await db.certificates.add(newCertificate);
      
      setCertificateData(newCertificate);
      setToast({ message: 'Acta generada y guardada localmente con éxito.', type: 'success'});
    } catch (err) {
      console.error("Error generating certificate:", err);
      setToast({ message: "Error al generar el acta. Verifique su clave de API.", type: 'error' });
      setCertificateData(null);
    } finally {
      setIsLoading(false);
    }
  }, [formData, folioNumber]);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12">
          <div>
            <LoanForm
              formData={formData}
              setFormData={setFormData}
              onGenerate={handleGenerateCertificate}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:sticky top-8 self-start">
            <CertificatePreview 
              data={certificateData} 
              placeholderData={{...formData, folioNumber}}
              setToast={setToast}
            />
          </div>
        </main>
        
        <CertificateHistory onSelect={(cert) => {
          setCertificateData(cert);
          setFormData({
            applicantName: cert.applicantName,
            applicantArea: cert.applicantArea,
            delivererName: cert.delivererName,
            hardwareItems: cert.hardwareItems,
            applicantEmail: cert.applicantEmail,
          });
          setToast({ message: 'Acta cargada desde el historial.', type: 'success' });
        }} />
      </div>
       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;