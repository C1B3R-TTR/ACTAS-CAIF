/**
 * Uploads a file to file.io and returns the download link.
 * @param file The file to upload.
 * @returns A promise that resolves with the download link.
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://file.io', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido al subir el archivo.' }));
      throw new Error(`Error al subir archivo: ${errorData.message} (Código: ${response.status})`);
    }

    const result = await response.json();
    if (result.success && result.link) {
      return result.link;
    } else {
      throw new Error('La respuesta de file.io no fue exitosa o no contenía un link.');
    }
  } catch (error) {
    console.error('Error uploading file to file.io:', error);
    throw new Error('No se pudo subir el archivo para generar el link de descarga.');
  }
}
