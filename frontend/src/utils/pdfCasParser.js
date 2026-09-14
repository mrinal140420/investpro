/**
 * InvestPro — Client-Side Password-Protected CAS PDF Decryptor
 * Uses Mozilla's PDF.js to decrypt CAMS and KFintech CAS PDFs entirely in-memory.
 * Preserves visual layout and line breaks using Y-coordinate delta detection.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { parseMFCentralText } from './mfcentralParser.js';

// Configure worker using official CDN matching installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * Decrypts a password-protected CAS PDF using the investor's PAN and extracts its text.
 * Preserves multi-page table structure and Demat holding lines.
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
      
      let pageText = '';
      let lastY = null;

      // Group text items into lines using Y-coordinate positioning
      for (const item of textContent.items) {
        const itemY = item.transform ? item.transform[5] : null;
        
        if (lastY !== null && itemY !== null && Math.abs(itemY - lastY) > 3.5) {
          pageText += '\n';
        } else if (pageText && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
          pageText += ' ';
        }
        
        pageText += item.str;
        if (itemY !== null) {
          lastY = itemY;
        }
      }

      fullText += `\n=== PAGE ${pageNum} OF ${numPages} ===\n` + pageText + '\n';
    } catch (pageErr) {
      console.warn(`Warning: Could not read page ${pageNum}:`, pageErr);
    }
  }

  if (!fullText.trim()) {
    throw new Error('PDF opened successfully but contained no readable text.');
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
