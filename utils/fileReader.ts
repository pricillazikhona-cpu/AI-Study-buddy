// Declare global variables from CDN scripts to inform TypeScript
declare const pdfjsLib: any;
declare const mammoth: any;

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Extracts text content from various file types (.txt, .pdf, .docx).
 * @param file The file to process.
 * @returns A promise that resolves with the extracted text content.
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  // Set the worker source for pdf.js from its CDN
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
  }

  const getArrayBuffer = (): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  switch (file.type) {
    case 'text/plain':
      return readFileAsText(file);
    
    case 'application/pdf':
      try {
        const arrayBuffer = await getArrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        return fullText.trim();
      } catch (error) {
        console.error("Error reading PDF file:", error);
        throw new Error("Failed to read the PDF file. It may be corrupted or protected.");
      }
      
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      try {
        const arrayBuffer = await getArrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } catch (error) {
        console.error("Error reading DOCX file:", error);
        throw new Error("Failed to read the DOCX file. It may be corrupted.");
      }
      
    default:
      throw new Error('Unsupported file type. Please upload a .txt, .pdf, or .docx file.');
  }
};