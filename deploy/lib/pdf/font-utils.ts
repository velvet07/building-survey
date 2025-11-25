import type jsPDF from 'jspdf';
import { ROBOTO_REGULAR, ROBOTO_BOLD } from './fonts/roboto';

let fontsRegistered = false;

export function ensureHungarianFont(pdf: jsPDF): void {
  if (!fontsRegistered) {
    pdf.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR);
    pdf.addFileToVFS('Roboto-Bold.ttf', ROBOTO_BOLD);
    pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    pdf.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
    fontsRegistered = true;
  }
  pdf.setFont('Roboto', 'normal');
}

export function setFont(pdf: jsPDF, style: 'normal' | 'bold'): void {
  ensureHungarianFont(pdf);
  pdf.setFont('Roboto', style);
}
