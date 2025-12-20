import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Farmer, Sale, MechanisationJob, Training, Visit } from '@/types';
import { mockLocalMRs } from '@/data/mockData';

// Generic Excel export
const exportToExcel = <T extends Record<string, any>>(data: T[], filename: string, sheetName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  if (data.length > 0) {
    const colWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length))
    }));
    worksheet['!cols'] = colWidths;
  }

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Generic PDF export
const exportToPDF = (title: string, headers: string[], rows: (string | number)[][], filename: string) => {
  const doc = new jsPDF('landscape');
  
  doc.setFontSize(18);
  doc.setTextColor(34, 139, 34);
  doc.text(title, 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Total: ${rows.length} records`, 14, 28);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 35,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [34, 139, 34], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Farmers Export
export const exportFarmersToExcel = (farmers: Farmer[], filename: string = 'farmers') => {
  const data = farmers.map(farmer => ({
    'Name': farmer.name,
    'Phone': farmer.phone,
    'Email': farmer.email || '',
    'Local MR': mockLocalMRs.find(mr => mr.id === farmer.localMrId)?.name || farmer.localMrName,
    'County': farmer.location.county,
    'Subcounty': farmer.location.subcounty,
    'Ward': farmer.location.ward,
    'Village': farmer.location.village,
    'Value Chain': farmer.valueChain,
    'Category': farmer.farmerCategory,
    'Rating': farmer.farmerRating,
    'Total Purchases': farmer.totalPurchases,
    'Mechanisation Count': farmer.mechanisationCount,
    'Trainings Attended': farmer.trainingsAttended,
    'Visits Count': farmer.visitsCount,
    'Registration Date': new Date(farmer.createdAt).toLocaleDateString(),
  }));
  exportToExcel(data, filename, 'Farmers');
};

export const exportFarmersToPDF = (farmers: Farmer[], filename: string = 'farmers') => {
  const headers = ['Name', 'Phone', 'Local MR', 'Location', 'Value Chain', 'Category', 'Rating', 'Purchases'];
  const rows = farmers.map(farmer => [
    farmer.name,
    farmer.phone,
    mockLocalMRs.find(mr => mr.id === farmer.localMrId)?.name || farmer.localMrName || '',
    `${farmer.location.village}, ${farmer.location.county}`,
    farmer.valueChain,
    farmer.farmerCategory,
    farmer.farmerRating,
    farmer.totalPurchases.toString(),
  ]);
  exportToPDF('Farmers Report', headers, rows, filename);
};

// Sales Export
export const exportSalesToExcel = (sales: Sale[], filename: string = 'sales') => {
  const data = sales.map(sale => ({
    'Date': new Date(sale.date).toLocaleDateString(),
    'Farmer': sale.farmerName,
    'Product': sale.productName,
    'Quantity': sale.quantity,
    'Unit Price (KES)': sale.unitPrice,
    'Total (KES)': sale.total,
    'Commission (KES)': sale.commissionAmount,
    'Status': sale.status,
    'Recorded By': sale.totName || '',
    'Local MR': sale.localMrName || '',
  }));
  exportToExcel(data, filename, 'Sales');
};

export const exportSalesToPDF = (sales: Sale[], filename: string = 'sales') => {
  const headers = ['Date', 'Farmer', 'Product', 'Qty', 'Total (KES)', 'Commission', 'Status'];
  const rows = sales.map(sale => [
    new Date(sale.date).toLocaleDateString(),
    sale.farmerName,
    sale.productName,
    sale.quantity,
    sale.total.toLocaleString(),
    sale.commissionAmount.toLocaleString(),
    sale.status,
  ]);
  exportToPDF('Sales Report', headers, rows, filename);
};

// Mechanisation Export
export const exportMechanisationToExcel = (jobs: MechanisationJob[], filename: string = 'mechanisation') => {
  const data = jobs.map(job => ({
    'Farmer': job.farmerName,
    'Service Type': job.serviceType,
    'Machinery': job.machineryName,
    'Acreage': job.acreage,
    'Price/Acre (KES)': job.pricePerAcre,
    'Total (KES)': job.totalPrice,
    'Commission (KES)': job.commissionAmount,
    'Scheduled Date': new Date(job.scheduledDate).toLocaleDateString(),
    'Status': job.status,
    'Booked By': job.bookedByName || '',
    'Local MR': job.localMrName || '',
  }));
  exportToExcel(data, filename, 'Mechanisation');
};

export const exportMechanisationToPDF = (jobs: MechanisationJob[], filename: string = 'mechanisation') => {
  const headers = ['Farmer', 'Service', 'Machinery', 'Acres', 'Total (KES)', 'Status', 'Date'];
  const rows = jobs.map(job => [
    job.farmerName,
    job.serviceType,
    job.machineryName,
    job.acreage,
    job.totalPrice.toLocaleString(),
    job.status,
    new Date(job.scheduledDate).toLocaleDateString(),
  ]);
  exportToPDF('Mechanisation Report', headers, rows, filename);
};

// Trainings Export
export const exportTrainingsToExcel = (trainings: Training[], filename: string = 'trainings') => {
  const data = trainings.map(training => ({
    'Title': training.title,
    'Type': training.type,
    'Date': new Date(training.date).toLocaleDateString(),
    'Location': training.location,
    'Duration (hrs)': training.duration,
    'Trainer': training.trainerName,
    'Attendees': training.attendees.length,
    'Topics': training.topics.join(', '),
    'Status': training.status,
    'Local MR': training.localMrName || '',
  }));
  exportToExcel(data, filename, 'Trainings');
};

export const exportTrainingsToPDF = (trainings: Training[], filename: string = 'trainings') => {
  const headers = ['Title', 'Type', 'Date', 'Location', 'Duration', 'Trainer', 'Attendees'];
  const rows = trainings.map(training => [
    training.title,
    training.type,
    new Date(training.date).toLocaleDateString(),
    training.location,
    `${training.duration} hrs`,
    training.trainerName,
    training.attendees.length.toString(),
  ]);
  exportToPDF('Trainings Report', headers, rows, filename);
};

// Visits Export
export const exportVisitsToExcel = (visits: Visit[], filename: string = 'visits') => {
  const data = visits.map(visit => ({
    'Farmer': visit.farmerName,
    'Purpose': visit.purpose,
    'Date': new Date(visit.date).toLocaleDateString(),
    'Notes': visit.notes,
    'Recorded By': visit.totName || '',
    'Local MR': visit.localMrName || '',
    'GPS Lat': visit.gpsLocation?.lat || '',
    'GPS Lng': visit.gpsLocation?.lng || '',
    'Has Photos': visit.images?.length ? 'Yes' : 'No',
  }));
  exportToExcel(data, filename, 'Visits');
};

export const exportVisitsToPDF = (visits: Visit[], filename: string = 'visits') => {
  const headers = ['Farmer', 'Purpose', 'Date', 'Notes', 'Recorded By'];
  const rows = visits.map(visit => [
    visit.farmerName,
    visit.purpose,
    new Date(visit.date).toLocaleDateString(),
    visit.notes.substring(0, 50) + (visit.notes.length > 50 ? '...' : ''),
    visit.totName || '',
  ]);
  exportToPDF('Visits Report', headers, rows, filename);
};