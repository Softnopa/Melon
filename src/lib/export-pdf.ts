import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Customer, HistoryEntry } from "@/lib/types";
import { formatMoney, formatDate } from "@/lib/format";

export function downloadCustomersPdf(
  customers: Customer[],
  organization: string,
  title = "Customers"
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(organization, 14, 16);
  doc.setFontSize(11);
  doc.text(`${title} — ${new Date().toLocaleDateString()}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [["Name", "Melons", "Total", "Paid", "Debt", "Cur", "Due"]],
    body: customers.map((c) => [
      c.name,
      String(c.melonAmount),
      String(c.totalCost),
      String(c.paidAmount),
      String(c.remainingDebt),
      c.currency,
      c.dueDate ? c.dueDate.slice(0, 10) : "—",
    ]),
    styles: { fontSize: 8 },
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

export function downloadHistoryPdf(
  history: HistoryEntry[],
  organization: string
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(organization, 14, 16);
  doc.setFontSize(11);
  doc.text(`Activity history — ${new Date().toLocaleDateString()}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [["Date", "Type", "Customer", "Description", "Amount"]],
    body: history.map((h) => [
      formatDate(h.timestamp),
      h.type,
      h.customerName,
      h.description,
      h.amount != null ? formatMoney(h.amount, h.currency) : "—",
    ]),
    styles: { fontSize: 8 },
  });

  doc.save("history.pdf");
}

export async function downloadCsvBlob(res: Response, filename: string) {
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
