
import React, { useState } from 'react';
import { CertificateData } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { SaveIcon } from './icons/SaveIcon';
import jsPDF from 'jspdf';
import { saveToGoogleDrive } from '../services/driveService';

interface CertificatePreviewProps {
  data: CertificateData | null;
  placeholderData: any;
  setToast: (toast: { message: string; type: 'error' | 'success' } | null) => void;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({ data, placeholderData, setToast }) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const currentData = data || {
    ...placeholderData,
    date: new Date(),
    agreementText: "Aquí aparecerá el texto legal generado por la IA una vez que completes el formulario y hagas clic en 'Generar Acta'."
  };

  const formattedDate = currentData.date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 20;

    // Header formal en el PDF
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('CIAF', margin, currentY);
    
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.setFont('helvetica', 'normal');
    doc.text('TECNOLOGÍA E INFRAESTRUCTURA', margin, currentY + 7);

    doc.setFontSize(10);
    doc.text(`Folio: ${currentData.folioNumber}`, pageWidth - margin, currentY + 5, { align: 'right' });
    
    currentY += 35;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('ACTA DE PRÉSTAMO DE EQUIPO DE CÓMPUTO', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 20;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${formattedDate}`, margin, currentY);
    doc.text(`Lugar: Pereira, Risaralda`, pageWidth - margin, currentY, { align: 'right' });

    currentY += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('1. PARTES INTERVINIENTES:', margin, currentY);
    
    currentY += 10;
    doc.setFont('helvetica', 'normal');
    const parties = `Se hace constar la entrega de equipos por parte del área de TI, representada por ${currentData.delivererName}, a el/la funcionario/a ${currentData.applicantName}, vinculado/a al área de ${currentData.applicantArea}.`;
    const splitParties = doc.splitTextToSize(parties, pageWidth - (margin * 2));
    doc.text(splitParties, margin, currentY);
    currentY += (splitParties.length * 7);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('2. EQUIPOS ENTREGADOS:', margin, currentY);
    currentY += 10;
    doc.setFont('helvetica', 'normal');
    const objects = currentData.hardwareItems || "No especificado";
    const splitObjects = doc.splitTextToSize(objects, pageWidth - (margin * 2));
    doc.text(splitObjects, margin, currentY);
    currentY += (splitObjects.length * 7);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('3. TÉRMINOS Y CONDICIONES:', margin, currentY);
    currentY += 10;
    doc.setFont('helvetica', 'normal');
    const splitAgreement = doc.splitTextToSize(currentData.agreementText, pageWidth - (margin * 2));
    doc.text(splitAgreement, margin, currentY);
    currentY += (splitAgreement.length * 7);

    currentY += 30;
    const colWidth = (pageWidth - (margin * 2)) / 2;
    
    // Simulación de firmas con nombres en cursiva
    doc.setFont('times', 'italic');
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(currentData.delivererName, margin + 5, currentY - 2);
    doc.text(currentData.applicantName, margin + colWidth + 15, currentY - 2);

    doc.setDrawColor(150);
    doc.line(margin, currentY, margin + colWidth - 10, currentY);
    doc.line(margin + colWidth + 10, currentY, pageWidth - margin, currentY);
    
    currentY += 5;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('Firma Entrega (TI)', margin, currentY);
    doc.text('Firma Recibe (Funcionario)', margin + colWidth + 10, currentY);
    
    currentY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(currentData.delivererName, margin, currentY);
    doc.text(currentData.applicantName, margin + colWidth + 10, currentY);

    return doc;
  };

  const handleDownload = () => {
    if (!data) return;
    const doc = generatePDF();
    const safeName = currentData.applicantName.trim().replace(/[^a-z0-9]/gi, '_');
    doc.save(`Acta_${safeName}_Folio_${currentData.folioNumber}.pdf`);
  };

  const handleSaveToDrive = async () => {
    if (!data) return;
    setIsUploading(true);
    try {
      const doc = generatePDF();
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const safeName = currentData.applicantName.trim().replace(/[^a-z0-9]/gi, '_');
      const filename = `Acta_${safeName}_Folio_${currentData.folioNumber}.pdf`;
      
      await saveToGoogleDrive({
        pdfBase64,
        // Enviamos el nombre del funcionario como parte del folio para que el script de Drive lo use en el nombre del archivo
        folioNumber: `${safeName}_${currentData.folioNumber}`,
        nombrePersona: currentData.applicantName,
        filename: filename,
        name: filename,
        title: filename
      });
      setToast({ message: 'Acta respaldada en Drive con éxito.', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al conectar con Drive.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div id="certificate-preview" className="bg-white text-gray-900 p-10 sm:p-16 rounded-none shadow-2xl min-h-[1000px] flex flex-col print:p-0 print:shadow-none border border-gray-200">
      {/* Encabezado formal */}
      <div className="flex justify-between items-start mb-16">
        <div className="border-l-4 border-gray-900 pl-4">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">CIAF</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Soporte Técnico & TI</p>
        </div>
        <div className="text-right">
          <div className="bg-gray-900 text-white px-4 py-2 inline-block">
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Acta No.</p>
            <p className="text-xl font-mono font-bold leading-none">{currentData.folioNumber}</p>
          </div>
        </div>
      </div>

      <div className="flex-grow px-4">
        <h3 className="text-2xl font-bold text-center mb-16 uppercase tracking-[0.2em] text-gray-900">
          Acta de Entrega de Hardware
        </h3>

        <div className="flex justify-between mb-12 text-xs font-bold border-y border-gray-100 py-4">
          <p className="text-gray-400 uppercase tracking-widest">Fecha: <span className="text-gray-900 ml-2">{formattedDate}</span></p>
          <p className="text-gray-400 uppercase tracking-widest">Lugar: <span className="text-gray-900 ml-2">Pereira, Risaralda</span></p>
        </div>

        <div className="space-y-12">
          <section>
            <h4 className="font-bold text-[10px] text-gray-400 uppercase mb-4 tracking-[0.2em]">01. Información de Entrega</h4>
            <p className="text-base leading-relaxed text-gray-800">
              Se formaliza la entrega física de los elementos de cómputo por parte de <span className="font-bold text-black underline decoration-gray-200 underline-offset-4">{currentData.delivererName}</span> a favor de <span className="font-bold text-black underline decoration-gray-200 underline-offset-4">{currentData.applicantName}</span>, identificado/a como personal activo del área de <span className="font-bold text-black">{currentData.applicantArea}</span>.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-[10px] text-gray-400 uppercase mb-4 tracking-[0.2em]">02. Relación de Equipos</h4>
            <div className="py-2">
              <p className="text-base font-medium text-gray-900 leading-relaxed whitespace-pre-wrap italic">
                {currentData.hardwareItems || "No se han descrito equipos para esta acta."}
              </p>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-[10px] text-gray-400 uppercase mb-4 tracking-[0.2em]">03. Compromiso de Uso</h4>
            <p className="text-sm leading-relaxed text-justify text-gray-600 font-serif italic">
              {currentData.agreementText}
            </p>
          </section>
        </div>

        {/* Sección de Firmas */}
        <div className="grid grid-cols-2 gap-24 mt-24">
          <div className="relative pt-8">
            <div className="absolute top-0 left-4 font-signature text-2xl text-gray-600 opacity-80 pointer-events-none">
              {currentData.delivererName}
            </div>
            <div className="border-t border-gray-900">
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Entregado por:</p>
              <p className="font-bold text-gray-900 text-sm">{currentData.delivererName}</p>
              <p className="text-[10px] text-gray-500 italic">Departamento de TI</p>
            </div>
          </div>
          <div className="relative pt-8">
            <div className="absolute top-0 left-4 font-signature text-2xl text-gray-600 opacity-80 pointer-events-none">
              {currentData.applicantName}
            </div>
            <div className="border-t border-gray-900">
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Recibido por:</p>
              <p className="font-bold text-gray-900 text-sm">{currentData.applicantName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción (no se imprimen) */}
      <div className="mt-16 flex gap-4 print:hidden">
        <button
          onClick={handleDownload}
          disabled={!data}
          className="flex-1 bg-white text-gray-900 border-2 border-gray-900 px-6 py-4 rounded-none flex items-center justify-center gap-3 hover:bg-gray-50 transition-all disabled:opacity-30 shadow-xl active:scale-95"
        >
          <DownloadIcon /> <span className="font-bold text-xs uppercase tracking-[0.2em]">Descargar PDF</span>
        </button>
        <button
          onClick={handleSaveToDrive}
          disabled={!data || isUploading}
          className="bg-green-600 text-white w-24 py-4 rounded-none flex items-center justify-center hover:bg-green-700 transition-all disabled:opacity-30 shadow-xl active:scale-95"
          title="Guardar en Drive"
        >
          {isUploading ? <SpinnerIcon /> : <SaveIcon />}
        </button>
      </div>
    </div>
  );
};

export default CertificatePreview;
