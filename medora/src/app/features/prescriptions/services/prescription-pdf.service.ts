import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Prescription } from '../models/prescription.model';

/** A4 dimensions in mm */
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN  = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Brand colours (converted from #6324eb and neutrals)
const COLOR_PRIMARY: [number, number, number] = [99, 36, 235];
const COLOR_TEXT:    [number, number, number] = [15, 23, 42];
const COLOR_MUTED:   [number, number, number] = [100, 116, 139];
const COLOR_BORDER:  [number, number, number] = [226, 232, 240];
const COLOR_BG:      [number, number, number] = [248, 250, 252];

@Injectable({ providedIn: 'root' })
export class PrescriptionPdfService {

  generate(rx: Prescription, patientPhone?: string | null): jsPDF {
    const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
    let   y    = MARGIN;

    // ── Header bar ──────────────────────────────────────────────────────────
    doc.setFillColor(...COLOR_PRIMARY);
    doc.rect(0, 0, PAGE_W, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('RECETA MÉDICA', MARGIN, 14);

    const dateStr = new Date(rx.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(dateStr, PAGE_W - MARGIN, 14, { align: 'right' });

    y = 32;

    // ── Patient / Doctor block ───────────────────────────────────────────────
    doc.setFillColor(...COLOR_BG);
    doc.roundedRect(MARGIN, y, CONTENT_W, 24, 2, 2, 'F');

    // Left column — Patient
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_MUTED);
    doc.text('PACIENTE', MARGIN + 5, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(rx.patientName, MARGIN + 5, y + 14);

    if (patientPhone) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(patientPhone, MARGIN + 5, y + 20);
    }

    // Right column — Doctor
    const rightX = PAGE_W / 2 + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_MUTED);
    doc.text('MÉDICO TRATANTE', rightX, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(`Dr. ${rx.professionalName}`, rightX, y + 14);

    // Vertical divider inside the block
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(PAGE_W / 2, y + 4, PAGE_W / 2, y + 21);

    y += 32;

    // ── Diagnosis ────────────────────────────────────────────────────────────
    this._sectionTitle(doc, 'DIAGNÓSTICO', y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_TEXT);
    const diagLines = doc.splitTextToSize(rx.diagnosis, CONTENT_W) as string[];
    doc.text(diagLines, MARGIN, y);
    y += diagLines.length * 5 + 3;

    if (rx.notes) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...COLOR_MUTED);
      const noteLines = doc.splitTextToSize(`Nota: ${rx.notes}`, CONTENT_W) as string[];
      doc.text(noteLines, MARGIN, y);
      y += noteLines.length * 4.5 + 3;
    }

    y += 3;
    this._hRule(doc, y);
    y += 6;

    // ── Medications ──────────────────────────────────────────────────────────
    this._sectionTitle(doc, 'MEDICAMENTOS PRESCRITOS', y);
    y += 8;

    rx.items.forEach((item, idx) => {
      // Check page overflow
      if (y > PAGE_H - 50) {
        doc.addPage();
        y = MARGIN + 10;
      }

      // Card background
      doc.setFillColor(...COLOR_BG);
      const cardH = item.instructions ? 26 : 21;
      doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 2, 2, 'F');

      // Number bubble
      doc.setFillColor(...COLOR_PRIMARY);
      doc.circle(MARGIN + 6, y + cardH / 2, 4.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(String(idx + 1), MARGIN + 6, y + cardH / 2 + 2.5, { align: 'center' });

      // Medication name
      const textX = MARGIN + 14;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLOR_TEXT);
      doc.text(item.medication, textX, y + 8);

      // Details row
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLOR_MUTED);
      const details = [
        `Dosis: ${item.dosage}`,
        `Frecuencia: ${item.frequency}`,
        `Duración: ${item.duration}`,
      ].join('   ·   ');
      doc.text(details, textX, y + 15);

      if (item.instructions) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(...COLOR_MUTED);
        doc.text(`Indicaciones: ${item.instructions}`, textX, y + 22);
      }

      y += cardH + 4;
    });

    y += 4;

    // ── Signatures ──────────────────────────────────────────────────────────
    const hasSigs = rx.doctorSignature || rx.patientSignature || rx.fingerprint;
    if (hasSigs) {
      if (y > PAGE_H - 70) { doc.addPage(); y = MARGIN + 10; }

      this._hRule(doc, y);
      y += 6;
      this._sectionTitle(doc, 'FIRMAS', y);
      y += 8;

      const sigW   = 50;
      const sigH   = 25;
      const sigGap = 8;
      let   sigX   = MARGIN;

      const drawSig = (src: string, label: string, x: number) => {
        try {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(...COLOR_BORDER);
          doc.setLineWidth(0.3);
          doc.roundedRect(x, y, sigW, sigH + 8, 2, 2, 'FD');
          doc.addImage(src, 'PNG', x + 2, y + 1, sigW - 4, sigH - 2);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(...COLOR_MUTED);
          doc.text(label, x + sigW / 2, y + sigH + 5, { align: 'center' });
        } catch { /* skip if image fails */ }
      };

      if (rx.doctorSignature) {
        drawSig(rx.doctorSignature, 'Firma del médico', sigX);
        sigX += sigW + sigGap;
      }
      if (rx.patientSignature) {
        drawSig(rx.patientSignature, 'Firma del paciente', sigX);
        sigX += sigW + sigGap;
      }
      if (rx.fingerprint) {
        drawSig(rx.fingerprint, 'Huella dactilar', sigX);
      }

      y += sigH + 16;
    }

    // ── Footer ──────────────────────────────────────────────────────────────
    const footerY = PAGE_H - 12;
    doc.setFillColor(...COLOR_PRIMARY);
    doc.rect(0, footerY - 2, PAGE_W, 14, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);

    const statusText = rx.finalizedAt
      ? `Receta finalizada el ${new Date(rx.finalizedAt).toLocaleDateString('es-ES')}`
      : 'Documento generado por Medora — Sistema de Gestión Clínica';
    doc.text(statusText, MARGIN, footerY + 5);
    doc.text(`ID: ${rx.id}`, PAGE_W - MARGIN, footerY + 5, { align: 'right' });

    return doc;
  }

  /** Download PDF to browser */
  download(rx: Prescription, patientPhone?: string | null): void {
    const doc      = this.generate(rx, patientPhone);
    const filename = `receta-${rx.patientName.toLowerCase().replace(/\s+/g, '-')}-${rx.id.slice(-6)}.pdf`;
    doc.save(filename);
  }

  /** Share via Web Share API (mobile) or fall back to download + WhatsApp link */
  async shareWhatsApp(rx: Prescription, patientPhone?: string | null): Promise<void> {
    const doc      = this.generate(rx, patientPhone);
    const filename = `receta-${rx.patientName.toLowerCase().replace(/\s+/g, '-')}-${rx.id.slice(-6)}.pdf`;
    const blob     = doc.output('blob');
    const file     = new File([blob], filename, { type: 'application/pdf' });

    const message = `Hola ${rx.patientName}, te compartimos tu receta médica del ${new Date(rx.createdAt).toLocaleDateString('es-ES')}. Diagnóstico: ${rx.diagnosis}.`;

    // Try Web Share API (works on mobile → user picks WhatsApp as target)
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'Receta Médica',
        text:  message,
        files: [file],
      });
      return;
    }

    // Desktop fallback: download PDF + open WhatsApp Web
    doc.save(filename);
    const phone    = patientPhone?.replace(/\D/g, '') ?? '';
    const encoded  = encodeURIComponent(message + '\n\nAdjunta el archivo PDF que se descargó automáticamente.');
    const waUrl    = phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private _sectionTitle(doc: jsPDF, text: string, y: number): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_PRIMARY);
    doc.text(text, MARGIN, y);
  }

  private _hRule(doc: jsPDF, y: number): void {
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  }
}
