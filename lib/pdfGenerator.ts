import { jsPDF } from "jspdf";
import { Invoice } from "../types";

export const generateInvoicePDF = (invoice: Invoice): void => {
  const doc = new jsPDF();

  // Set font
  doc.setFont("helvetica");

  // Header - Firma info
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Brand blue
  doc.text("RENDETALJE", 20, 25);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Professionel rengøring siden 2024", 20, 32);
  doc.text("CVR: 12345678", 20, 38);
  doc.text("Telefon: +45 12 34 56 78", 20, 44);
  doc.text("Email: kontakt@rendetalje.dk", 20, 50);

  // Invoice header
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("FAKTURA", 160, 25);

  doc.setFontSize(10);
  doc.text(`Fakturanummer: ${invoice.invoiceNumber}`, 160, 35);
  doc.text(`Dato: ${formatDate(invoice.issuedDate)}`, 160, 42);
  doc.text(`Forfaldsdato: ${formatDate(invoice.dueDate)}`, 160, 49);

  // Customer info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Faktureres til:", 20, 70);

  doc.setFontSize(10);
  doc.text(invoice.customerName, 20, 80);

  // Split address into lines if it's long
  const addressLines =
    invoice.customerAddress.length > 40
      ? [
          invoice.customerAddress.substring(0, 40),
          invoice.customerAddress.substring(40),
        ]
      : [invoice.customerAddress];

  addressLines.forEach((line, index) => {
    doc.text(line, 20, 87 + index * 7);
  });

  // Table header
  const tableY = 120;
  doc.setFillColor(37, 99, 235);
  doc.rect(20, tableY, 170, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("Beskrivelse", 25, tableY + 7);
  doc.text("Dato", 100, tableY + 7);
  doc.text("Timer", 130, tableY + 7);
  doc.text("Pris/time", 150, tableY + 7);
  doc.text("Beløb", 175, tableY + 7);

  // Table content
  doc.setTextColor(0, 0, 0);
  const contentY = tableY + 20;
  doc.text("Rengøringsservice", 25, contentY);
  doc.text(formatDate(invoice.taskDate), 100, contentY);
  doc.text(invoice.hours.toString(), 130, contentY);
  doc.text(`${invoice.hourlyRate.toFixed(0)} kr`, 150, contentY);
  doc.text(`${invoice.totalAmount.toFixed(0)} kr`, 175, contentY);

  // Line under table content
  doc.line(20, contentY + 5, 190, contentY + 5);

  // Totals
  const totalsY = contentY + 20;
  doc.setFontSize(10);

  const subtotal = invoice.totalAmount * 0.8;
  const vat = invoice.totalAmount * 0.2;

  doc.text("Subtotal (ekskl. moms):", 130, totalsY);
  doc.text(`${subtotal.toFixed(0)} kr`, 175, totalsY);

  doc.text("Moms (25%):", 130, totalsY + 10);
  doc.text(`${vat.toFixed(0)} kr`, 175, totalsY + 10);

  // Total line
  doc.line(130, totalsY + 15, 190, totalsY + 15);
  doc.setFontSize(12);
  doc.text("Total:", 130, totalsY + 25);
  doc.text(`${invoice.totalAmount.toFixed(0)} kr`, 175, totalsY + 25);

  // Payment info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const paymentY = totalsY + 45;

  doc.text("Betalingsoplysninger:", 20, paymentY);
  doc.text("Bankregistry: 1234-12345678901", 20, paymentY + 10);
  doc.text(`Betalingsdato: ${formatDate(invoice.dueDate)}`, 20, paymentY + 20);
  doc.text(
    "Renter 1.5% pr. påbegyndt måned ved for sen betaling",
    20,
    paymentY + 30
  );

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text("Rendetalje - Kvalitet du kan stole på", 20, 280);
  doc.text("Mvh. Rawan Abdul-Halim & Jonas Abde", 140, 280);

  // Download the PDF
  doc.save(`Faktura_${invoice.invoiceNumber}.pdf`);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
