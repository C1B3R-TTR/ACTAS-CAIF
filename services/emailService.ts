// This file encapsulates the logic for sending emails using EmailJS.
// It now sends a text-only notification email with a download link.

// This is a global variable from the EmailJS SDK script in index.html
declare const emailjs: any;

// --- CONFIGURACIÓN DE EMAILJS ---
// Reemplaza estos valores con tus credenciales reales de EmailJS.
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "QxFogffBeozd29LXs",      // Encuéntrala en Account -> API Keys
  SERVICE_ID: 'service_ie4hzei',      // Encuéntralo en Email Services
  TEMPLATE_ID: 'template_uils5jy'     // Encuéntralo en Email Templates
};

// Initialize EmailJS with your Public Key.
(function(){
    emailjs.init({
      publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
    });
})();

interface EmailParams {
  to_name: string;
  to_email: string;
  from_name: string;
  folio_number: string;
  pdf_link: string;
}

/**
 * Sends a notification email via EmailJS with a Data URI download link.
 * @param params - The email parameters including recipient details and the PDF Data URI.
 * @returns A promise that resolves on successful sending.
 *
 * --- ¡IMPORTANTE! INSTRUCCIONES PARA EL DASHBOARD DE EMAILJS ---
 * Este servicio envía un correo con un link de descarga directa (Data URI).
 *
 * 1. Ve a tu plantilla (Template ID: 'template_uils5jy').
 *
 * 2. Pestaña "Content":
 *    - El cuerpo del correo debe incluir un enlace HTML. La variable {{pdf_link}} contendrá
 *      el PDF completo incrustado en el link. Usa el editor de código (</>) para pegar esto:
 *      
 *      <p>Hola {{to_name}},</p>
 *      <p>Tu acta de préstamo de hardware ha sido generada con éxito.</p>
 *      <p>
 *        <a href="{{pdf_link}}" download="Acta_Folio_{{folio_number}}.pdf" style="color: #0891b2; text-decoration: underline;">
 *          Haz clic aquí para descargar tu acta
 *        </a>
 *      </p>
 *      <p>Tu número de folio para referencia es: <strong>{{folio_number}}</strong>.</p>
 *      <p>Saludos,<br>{{from_name}}</p>
 *
 *    - El atributo 'download' es CRUCIAL para que el navegador guarde el archivo en lugar de navegar a la URL.
 *
 * 3. Pestaña "Attachments":
 *    - ASEGÚRATE DE ELIMINAR CUALQUIER ADJUNTO. Esta plantilla ya no envía archivos adjuntos.
 */
export async function sendCertificateByEmail(params: EmailParams): Promise<void> {
  if (
    EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY' ||
    EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID' ||
    EMAILJS_CONFIG.TEMPLATE_ID === 'YOUR_TEMPLATE_ID'
  ) {
    const errorMessage = "Configuración de EmailJS incompleta. Por favor, abre el archivo 'services/emailService.ts' y reemplaza los valores 'YOUR_...' con tus credenciales reales de EmailJS.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Prepara los parámetros para la plantilla de EmailJS.
  const templateParams = {
    to_name: params.to_name,
    to_email: params.to_email,
    from_name: params.from_name,
    folio_number: params.folio_number,
    pdf_link: params.pdf_link,
  };

  // Envía el correo de notificación.
  try {
    await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);
    console.log('Notification email sent successfully via EmailJS!');
  } catch (error: any) {
    // Captura y muestra un error detallado si el envío falla.
    console.error('Failed to send email via EmailJS:', error);
    let detailedMessage = 'Error al enviar el correo de notificación.';
    if (error?.status && error?.text) {
      detailedMessage += ` Detalles: ${error.text} (Código: ${error.status})`;
    } else if (error instanceof Error) {
      detailedMessage += ` Detalles: ${error.message}`;
    }
    throw new Error(detailedMessage);
  }
}