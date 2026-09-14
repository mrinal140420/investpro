/**
 * InvestPro — Client-Side Password-Protected CAS PDF Decryptor
 * Uses Mozilla's PDF.js to decrypt CAMS and KFintech CAS PDFs entirely in-memory.
 * Zero external transmission of passwords or portfolio data.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { parseMFCentralText } from './mfcentralParser.js';

// Configure worker using official CDN matching installed version to avoid Vite bundling worker issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * Decrypts a password-protected CAS PDF using the investor's PAN and extracts its text.
 * @param {File} file - The uploaded PDF file
 * @param {string} password - The investor's uppercase PAN
 * @returns {Promise<string>} Extracted plain text of all pages
 */
export async function decryptAndExtractPdfText(file, password) {
  if (!file) {
    throw new Error('No PDF file provided.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const panUpper = (password || '').trim().toUpperCase();

  // Try uppercase PAN first, then lowercase if uppercase fails
  const passwordsToTry = [panUpper];
  if (panUpper) {
    passwordsToTry.push(panUpper.toLowerCase());
  }

  let pdfDoc = null;
  let lastErr = null;

  for (const pwd of passwordsToTry) {
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        password: pwd || undefined,
        stopAtErrors: false,
        useSystemFonts: true,
        isEvalSupported: false,
      });

      pdfDoc = await loadingTask.promise;
      break;
    } catch (err) {
      lastErr = err;
      // If error is not a password error, don't keep trying
      if (err && err.name !== 'PasswordException') {
        throw new Error(`PDF Error: ${err.message || 'Unable to open PDF'}`);
      }
    }
  }

  if (!pdfDoc) {
    if (lastErr && lastErr.name === 'PasswordException') {
      throw new Error('Incorrect PAN Password. CAS files are encrypted with your 10-character PAN in UPPERCASE (e.g. ABCDE1234F).');
    }
    throw new Error(`Failed to decrypt CAS PDF: ${lastErr?.message || 'Invalid or corrupted statement'}`);
  }

  let fullText = '';
  const numPages = pdfDoc.numPages;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map(item => item.str);
      fullText += pageStrings.join(' ') + '\n';
    } catch (pageErr) {
      console.warn(`Warning: Could not read page ${pageNum}:`, pageErr);
    }
  }

  if (!fullText.trim()) {
    throw new Error('PDF opened successfully but contained no readable text. Please check if this is a valid CAMS/KFintech statement.');
  }

  return fullText;
}

/**
 * High-level helper: Decrypts PDF and parses into normalized InvestPro portfolio session.
 */
export async function decryptAndParseCAS(file, password) {
  const text = await decryptAndExtractPdfText(file, password);
  return parseMFCentralText(text);
}
