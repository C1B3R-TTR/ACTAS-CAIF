
interface SaveToDriveParams {
  pdfBase64: string;
  folioNumber: string;
  nombrePersona: string;
  filename?: string;
  name?: string;
  title?: string;
}

// URL of the Google Apps Script web app
const DRIVE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfRgtJIpOazRcrnDkOjKvaYyFjmuSUWtMxRXgJiWaaXk-Gr3lFMCFPX3PSVBbLBgzw_Q/exec';

/**
 * Sends the generated PDF data to a Google Apps Script to be saved in Google Drive.
 */
export async function saveToGoogleDrive(params: SaveToDriveParams): Promise<void> {
  try {
    const response = await fetch(DRIVE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(params), 
    });

    if (!response.ok) {
      throw new Error(`Error del servidor de Google Scripts: ${response.statusText} (Código: ${response.status})`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      console.log('PDF guardado en Drive con éxito:', result);
    } else {
      console.error('El script de Google Drive reportó un error:', result.message);
      throw new Error(`El respaldo en Drive falló: ${result.message}`);
    }

  } catch (error) {
    console.error('Falló la comunicación con el script de Google Drive:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('No se pudo completar el respaldo en Drive.');
    }
  }
}
