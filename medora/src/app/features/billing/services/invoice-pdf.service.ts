import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Invoice, InvoiceStatus, INVOICE_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../models/invoice.model';

/** A4 dimensions in mm */
const PAGE_W    = 210;
const PAGE_H    = 297;
const MARGIN    = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

const COLOR_PRIMARY: [number, number, number] = [99, 36, 235];
const COLOR_TEXT:    [number, number, number] = [15, 23, 42];
const COLOR_MUTED:   [number, number, number] = [100, 116, 139];
const COLOR_BORDER:  [number, number, number] = [226, 232, 240];
const COLOR_BG:      [number, number, number] = [248, 250, 252];
const COLOR_SUCCESS: [number, number, number] = [22, 163, 74];

@Injectable({ providedIn: 'root' })
export class InvoicePdfService {

  generate(inv: Invoice): jsPDF {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let   y   = MARGIN;

    // ── Header bar ────────────────────────────────────────────────────────────
    doc.setFillColor(...COLOR_PRIMARY);
    doc.rect(0, 0, PAGE_W, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('FACTURA', MARGIN, 14);

    const statusLabel = INVOICE_STATUS_LABELS[inv.status] ?? inv.status;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(statusLabel.toUpperCase(), PAGE_W - MARGIN, 14, { align: 'right' });

    y = 30;

    // ── Meta block (Nº factura + fechas) ──────────────────────────────────────
    doc.setFillColor(...COLOR_BG);
    doc.roundedRect(MARGIN, y, CONTENT_W, 22, 2, 2, 'F');

    const colW = CONTENT_W / 3;

    this._metaCell(doc, 'N° FACTURA',  `…${inv.id.slice(-8).toUpperCase()}`, MARGIN + 5,         y);
    this._metaCell(doc, 'FECHA EMISIÓN', this._fmtDate(inv.createdAt),        MARGIN + colW + 5,  y);
    this._metaCell(doc, 'VENCIMIENTO',  inv.dueDate ? this._fmtDate(inv.dueDate) : '—',
                                                                               MARGIN + colW * 2 + 5, y);

    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN + colW,     y + 4, MARGIN + colW,     y + 19);
    doc.line(MARGIN + colW * 2, y + 4, MARGIN + colW * 2, y + 19);

    y += 30;

    // ── Patient block ─────────────────────────────────────────────────────────
    this._sectionTitle(doc, 'PACIENTE', y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(inv.patientName, MARGIN, y);
    y += 5;

    if (inv.treatmentPlanTitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(`Plan de tratamiento: ${inv.treatmentPlanTitle}`, MARGIN, y);
      y += 5;
    }

    if (inv.notes) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLOR_MUTED);
      const noteLines = doc.splitTextToSize(`Nota: ${inv.notes}`, CONTENT_W) as string[];
      doc.text(noteLines, MARGIN, y);
      y += noteLines.length * 4.5;
    }

    y += 5;
    this._hRule(doc, y);
    y += 7;

    // ── Items table ───────────────────────────────────────────────────────────
    this._sectionTitle(doc, 'DETALLE DE SERVICIOS', y);
    y += 7;

    // Table header
    doc.setFillColor(...COLOR_PRIMARY);
    doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('DESCRIPCIÓN',          MARGIN + 3,           y + 5);
    doc.text('CANT.',                MARGIN + CONTENT_W * 0.62, y + 5, { align: 'right' });
    doc.text('P. UNIT.',             MARGIN + CONTENT_W * 0.78, y + 5, { align: 'right' });
    doc.text('TOTAL',                MARGIN + CONTENT_W - 3,    y + 5, { align: 'right' });
    y += 7;

    // Table rows
    inv.items.forEach((item, idx) => {
      if (y > PAGE_H - 60) { doc.addPage(); y = MARGIN + 10; }

      if (idx % 2 === 0) {
        doc.setFillColor(...COLOR_BG);
        doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLOR_TEXT);

      const desc = doc.splitTextToSize(item.description, CONTENT_W * 0.58) as string[];
      doc.text(desc[0], MARGIN + 3, y + 5);

      doc.setTextColor(...COLOR_MUTED);
      doc.text(String(item.quantity),                            MARGIN + CONTENT_W * 0.62, y + 5, { align: 'right' });
      doc.text(this._currency(item.unitPrice),                   MARGIN + CONTENT_W * 0.78, y + 5, { align: 'right' });
      doc.setTextColor(...COLOR_TEXT);
      doc.text(this._currency(item.total),                       MARGIN + CONTENT_W - 3,    y + 5, { align: 'right' });

      y += 7;
    });

    // Bottom border of table
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 5;

    // ── Totals block ─────────────────────────────────────────────────────────
    const totalsX = MARGIN + CONTENT_W * 0.55;
    const totalsW = CONTENT_W * 0.45;

    const totalRow = (label: string, value: string, bold = false, color: [number,number,number] = COLOR_TEXT) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 10 : 9);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(label, totalsX, y + 5);
      doc.setTextColor(...color);
      doc.text(value, totalsX + totalsW - 3, y + 5, { align: 'right' });
      y += 7;
    };

    totalRow('Subtotal',      this._currency(inv.total));
    totalRow('Pagado',        this._currency(inv.paid),    false, COLOR_SUCCESS);
    totalRow('Saldo pendiente', this._currency(inv.balance), true,
      inv.balance > 0 ? [220, 38, 38] : COLOR_SUCCESS);

    y += 4;

    // ── Payments ─────────────────────────────────────────────────────────────
    if (inv.payments.length > 0) {
      if (y > PAGE_H - 60) { doc.addPage(); y = MARGIN + 10; }

      this._hRule(doc, y);
      y += 7;
      this._sectionTitle(doc, 'PAGOS REGISTRADOS', y);
      y += 7;

      inv.payments.forEach(p => {
        if (y > PAGE_H - 40) { doc.addPage(); y = MARGIN + 10; }

        doc.setFillColor(...COLOR_BG);
        doc.roundedRect(MARGIN, y, CONTENT_W, 9, 1.5, 1.5, 'F');

        const methodLabel = (PAYMENT_METHOD_LABELS as Record<string, string>)[p.method] ?? p.method;
        const paidDate    = this._fmtDate(p.paidAt);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...COLOR_TEXT);
        doc.text(`${methodLabel}${p.reference ? ` · Ref: ${p.reference}` : ''}`, MARGIN + 4, y + 6);

        doc.setTextColor(...COLOR_MUTED);
        doc.text(paidDate, MARGIN + CONTENT_W * 0.6, y + 6);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLOR_SUCCESS);
        doc.text(this._currency(p.amount), MARGIN + CONTENT_W - 3, y + 6, { align: 'right' });

        y += 12;
      });
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const footerY = PAGE_H - 12;
    doc.setFillColor(...COLOR_PRIMARY);
    doc.rect(0, footerY - 2, PAGE_W, 14, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('Documento generado por Medora — Sistema de Gestión Clínica', MARGIN, footerY + 5);
    doc.text(`ID: ${inv.id}`, PAGE_W - MARGIN, footerY + 5, { align: 'right' });

    return doc;
  }

  /** Download PDF to browser */
  download(inv: Invoice): void {
    const filename = this._filename(inv);
    this.generate(inv).save(filename);
  }

  /** Share via Web Share API (mobile) or fall back to download + WhatsApp link */
  async shareWhatsApp(inv: Invoice, patientPhone?: string | null): Promise<void> {
    const doc      = this.generate(inv);
    const filename = this._filename(inv);
    const blob     = doc.output('blob');
    const file     = new File([blob], filename, { type: 'application/pdf' });

    const statusLabel = INVOICE_STATUS_LABELS[inv.status] ?? inv.status;
    const message = `Hola ${inv.patientName}, te compartimos tu factura del ${this._fmtDate(inv.createdAt)} por un total de ${this._currency(inv.total)}. Estado: ${statusLabel}.`;

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: 'Factura', text: message, files: [file] });
      return;
    }

    // Desktop fallback
    doc.save(filename);
    const phone   = patientPhone?.replace(/\D/g, '') ?? '';
    const encoded = encodeURIComponent(message + '\n\nAdjunta el archivo PDF que se descargó automáticamente.');
    window.open(phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`, '_blank');
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private _filename(inv: Invoice): string {
    return `factura-${inv.patientName.toLowerCase().replace(/\s+/g, '-')}-${inv.id.slice(-6)}.pdf`;
  }

  private _fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  private _currency(n: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
  }

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

  private _metaCell(doc: jsPDF, label: string, value: string, x: number, y: number): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(label, x, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(value, x, y + 16);
  }
}
