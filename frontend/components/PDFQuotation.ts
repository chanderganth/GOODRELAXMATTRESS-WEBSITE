import type { MattressConfig, PriceBreakdown } from '@/lib/types';
import { formatPrice } from '@/lib/priceCalculator';

export function generatePDFQuotation(
  config: MattressConfig,
  priceBreakdown: PriceBreakdown,
  orderNumber?: string,
): void {
  // Run only in browser
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const margin = 20;
    let y = 24;

    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pageWidth, 34, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GoodRelax Mattress', margin, 16);

    doc.setTextColor(232, 184, 93);
    doc.setFontSize(12);
    doc.text('QUOTATION', pageWidth - margin, 16, { align: 'right' });

    doc.setTextColor(220, 220, 230);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, 23, { align: 'right' });
    if (orderNumber) {
      doc.text(`Ref: ${orderNumber}`, pageWidth - margin, 28, { align: 'right' });
    }

    y = 52;
    doc.setTextColor(26, 26, 46);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Quotation Details', margin, y);
    y += 10;

    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y - 6, 170, 46, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y - 6, 170, 46);

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text('Mattress Size', margin + 4, y + 2);
    doc.text(`${config.size.length} x ${config.size.width} x ${config.size.thickness} inches`, margin + 70, y + 2);

    doc.text('Subtotal', margin + 4, y + 13);
    doc.text(formatPrice(priceBreakdown.subtotal), margin + 150, y + 13, { align: 'right' });

    doc.text('GST (18%)', margin + 4, y + 24);
    doc.text(formatPrice(priceBreakdown.gstAmount), margin + 150, y + 24, { align: 'right' });

    doc.setFillColor(26, 26, 46);
    doc.rect(margin + 2, y + 29, 166, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Price', margin + 6, y + 35.5);
    doc.setTextColor(232, 184, 93);
    doc.text(formatPrice(priceBreakdown.totalPrice), margin + 164, y + 35.5, { align: 'right' });

    y += 52;
    doc.setTextColor(22, 101, 52);
    doc.setFillColor(220, 252, 231);
    doc.rect(margin, y, 170, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Note: GST is included in the total price shown above.', margin + 4, y + 6.5);

    y += 20;
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Thank you for choosing GoodRelax Mattress.', margin, y);

    const filename = orderNumber
      ? `GoodRelax-Quotation-${orderNumber}.pdf`
      : `GoodRelax-Quotation-${Date.now()}.pdf`;
    doc.save(filename);
  });
}
