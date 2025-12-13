import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Farmer } from '@/types';
import { mockBranches } from '@/data/mockData';

export const exportFarmersToExcel = (farmers: Farmer[], filename: string = 'farmers') => {
  const data = farmers.map(farmer => ({
    'Name': farmer.name,
    'Phone': farmer.phone,
    'Email': farmer.email || '',
    'Branch': mockBranches.find(b => b.id === farmer.branchId)?.name || farmer.branchId,
    'County': farmer.location.county,
    'Subcounty': farmer.location.subcounty,
    'Ward': farmer.location.ward,
    'Village': farmer.location.village,
    'Value Chain': farmer.valueChain,
    'Category': farmer.farmerCategory,
    'Rating': farmer.farmerRating,
    'Farming Activity': farmer.farmingActivity,
    'Total Purchases': farmer.totalPurchases,
    'Mechanisation Count': farmer.mechanisationCount,
    'Trainings Attended': farmer.trainingsAttended,
    'Visits Count': farmer.visitsCount,
    'Registration Date': new Date(farmer.createdAt).toLocaleDateString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Farmers');
  
  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key as keyof typeof row] || '').length))
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportFarmersToPDF = (farmers: Farmer[], filename: string = 'farmers') => {
  const doc = new jsPDF('landscape');
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(34, 139, 34); // Forest green
  doc.text('Farmers Report', 14, 20);
  
  // Subtitle with date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Total: ${farmers.length} farmers`, 14, 28);

  // Table data
  const tableData = farmers.map(farmer => [
    farmer.name,
    farmer.phone,
    mockBranches.find(b => b.id === farmer.branchId)?.name || farmer.branchId,
    `${farmer.location.village}, ${farmer.location.county}`,
    farmer.valueChain,
    farmer.farmerCategory,
    farmer.farmerRating,
    farmer.totalPurchases.toString(),
  ]);

  autoTable(doc, {
    head: [['Name', 'Phone', 'Branch', 'Location', 'Value Chain', 'Category', 'Rating', 'Purchases']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [34, 139, 34], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};
