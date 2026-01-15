import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Download, Users, FileSpreadsheet, FileText, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useFarmersAndTots } from '@/hooks/api/useFarmersAndTots';
import { useAddMultipleAttendees } from '@/hooks/api/useTrainings';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface AttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingId: string;
  trainingTitle: string;
  localMrId?: string;
}

interface AttendeeInfo {
  farmerId: string;
  name: string;
  phone: string;
  village: string;
  selected: boolean;
}

interface UploadError {
  row: number;
  phone: string;
  name: string;
  reason: string;
}

export function AttendanceModal({ 
  open, 
  onOpenChange, 
  trainingId, 
  trainingTitle,
  localMrId 
}: AttendanceModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([]);
  const [activeTab, setActiveTab] = useState('manual');
  const [uploadErrors, setUploadErrors] = useState<UploadError[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: farmers = [] } = useFarmersAndTots({ localMrId });
  const addAttendees = useAddMultipleAttendees();

  useEffect(() => {
    if (open && farmers.length > 0) {
      setAttendees(farmers.map(f => ({
        farmerId: f.id,
        name: f.name,
        phone: f.phone || '',
        village: f.village || '',
        selected: false,
      })));
      setUploadErrors([]);
      setUploadSuccess([]);
    }
  }, [open, farmers]);

  const filteredAttendees = attendees.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.phone.includes(searchQuery) ||
    a.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = attendees.filter(a => a.selected).length;

  const handleToggle = (farmerId: string) => {
    setAttendees(prev => prev.map(a => 
      a.farmerId === farmerId ? { ...a, selected: !a.selected } : a
    ));
  };

  const handleSelectAll = () => {
    const allSelected = filteredAttendees.every(a => a.selected);
    const filteredIds = new Set(filteredAttendees.map(a => a.farmerId));
    setAttendees(prev => prev.map(a => 
      filteredIds.has(a.farmerId) ? { ...a, selected: !allSelected } : a
    ));
  };

  const handleSubmit = () => {
    const selectedFarmers = attendees.filter(a => a.selected);
    if (selectedFarmers.length === 0) {
      toast.error('Please select at least one attendee');
      return;
    }

    addAttendees.mutate({
      trainingId,
      farmerIds: selectedFarmers.map(f => f.farmerId),
    }, {
      onSuccess: () => {
        toast.success(`${selectedFarmers.length} attendees recorded`);
        onOpenChange(false);
      },
    });
  };

  // Handle Excel file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadErrors([]);
    setUploadSuccess([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          toast.error('Excel file is empty or has no data rows');
          setIsUploading(false);
          return;
        }

        // Find phone column (case-insensitive)
        const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim());
        const phoneIndex = headers.findIndex((h: string) => 
          h.includes('phone') || h.includes('tel') || h.includes('mobile') || h.includes('contact')
        );
        const nameIndex = headers.findIndex((h: string) => h.includes('name'));

        if (phoneIndex === -1) {
          toast.error('Could not find phone number column. Please ensure your Excel has a "Phone" column.');
          setIsUploading(false);
          return;
        }

        const errors: UploadError[] = [];
        const matchedFarmerIds: string[] = [];
        const matchedNames: string[] = [];

        // Process each row (skip header)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const phone = String(row[phoneIndex] || '').trim().replace(/\s+/g, '');
          const name = nameIndex !== -1 ? String(row[nameIndex] || '').trim() : 'Unknown';

          if (!phone) {
            errors.push({ row: i + 1, phone: '', name, reason: 'Empty phone number' });
            continue;
          }

          // Normalize phone number for matching (remove leading 0 or +254)
          const normalizedPhone = phone.replace(/^(\+254|254|0)/, '');
          
          // Find matching farmer by phone
          const matchedFarmer = farmers.find(f => {
            const farmerPhone = (f.phone || '').replace(/\s+/g, '').replace(/^(\+254|254|0)/, '');
            return farmerPhone === normalizedPhone || f.phone === phone;
          });

          if (matchedFarmer) {
            if (!matchedFarmerIds.includes(matchedFarmer.id)) {
              matchedFarmerIds.push(matchedFarmer.id);
              matchedNames.push(matchedFarmer.name);
            }
          } else {
            errors.push({ row: i + 1, phone, name, reason: 'Farmer not found in system' });
          }
        }

        setUploadErrors(errors);
        setUploadSuccess(matchedNames);

        // Auto-select matched farmers
        if (matchedFarmerIds.length > 0) {
          setAttendees(prev => prev.map(a => ({
            ...a,
            selected: matchedFarmerIds.includes(a.farmerId) ? true : a.selected,
          })));
          toast.success(`Matched ${matchedFarmerIds.length} farmers from Excel`);
        }

        if (errors.length > 0) {
          toast.warning(`${errors.length} rows could not be matched`);
        }

      } catch (err) {
        console.error('Error parsing Excel:', err);
        toast.error('Failed to parse Excel file');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      { Name: 'John Doe', Phone: '0712345678', Village: 'Sample Village' },
      { Name: 'Jane Doe', Phone: '0723456789', Village: 'Sample Village' },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Template');
    XLSX.writeFile(wb, 'attendance_template.xlsx');
    toast.success('Template downloaded');
  };

  const exportToExcel = () => {
    const selectedData = attendees
      .filter(a => a.selected)
      .map((a, idx) => ({
        '#': idx + 1,
        'Name': a.name,
        'Phone': a.phone,
        'Village': a.village,
      }));

    if (selectedData.length === 0) {
      toast.error('No attendees selected to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(selectedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `${trainingTitle}_attendance.xlsx`);
    toast.success('Exported to Excel');
  };

  const exportToPDF = () => {
    const selectedData = attendees.filter(a => a.selected);
    if (selectedData.length === 0) {
      toast.error('No attendees selected to export');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Training Attendance: ${trainingTitle}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Total Attendees: ${selectedData.length}`, 14, 34);

    const tableData = selectedData.map((a, idx) => [
      idx + 1,
      a.name,
      a.phone,
      a.village,
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['#', 'Name', 'Phone', 'Village']],
      body: tableData,
      theme: 'grid',
    });

    doc.save(`${trainingTitle}_attendance.pdf`);
    toast.success('Exported to PDF');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Record Attendance - {trainingTitle}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Selection</TabsTrigger>
            <TabsTrigger value="upload">Excel Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary" className="whitespace-nowrap">
                {selectedCount} selected
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {filteredAttendees.every(a => a.selected) ? 'Deselect All' : 'Select All'}
              </Button>
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={exportToExcel} disabled={selectedCount === 0}>
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF} disabled={selectedCount === 0}>
                <FileText className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>

            <ScrollArea className="flex-1 max-h-[350px] border rounded-md">
              <div className="p-2 space-y-1">
                {filteredAttendees.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No farmers or TOTs found</p>
                ) : (
                  filteredAttendees.map((attendee) => (
                    <div
                      key={attendee.farmerId}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        attendee.selected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleToggle(attendee.farmerId)}
                    >
                      <Checkbox checked={attendee.selected} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{attendee.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {attendee.phone} • {attendee.village}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">
                Upload an Excel file with farmer phone numbers to match attendance
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-1" />
                  Download Template
                </Button>
                <Button 
                  variant="forest" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  {isUploading ? 'Processing...' : 'Upload Excel'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {uploadSuccess.length > 0 && (
              <Alert className="border-emerald-500 bg-emerald-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <AlertDescription className="text-emerald-700">
                  <strong>{uploadSuccess.length} farmers matched:</strong>{' '}
                  {uploadSuccess.slice(0, 5).join(', ')}
                  {uploadSuccess.length > 5 && ` and ${uploadSuccess.length - 5} more...`}
                </AlertDescription>
              </Alert>
            )}

            {uploadErrors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {uploadErrors.length} rows could not be matched:
                </p>
                <ScrollArea className="max-h-[150px] border rounded-md">
                  <div className="p-2 space-y-1">
                    {uploadErrors.map((err, i) => (
                      <div key={i} className="text-xs p-2 bg-destructive/10 rounded">
                        <span className="font-medium">Row {err.row}:</span> {err.name} ({err.phone}) - {err.reason}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Badge variant="secondary">{selectedCount} farmers selected</Badge>
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={exportToExcel} disabled={selectedCount === 0}>
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Export Selected
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="forest" 
            onClick={handleSubmit}
            disabled={selectedCount === 0 || addAttendees.isPending}
          >
            {addAttendees.isPending ? 'Saving...' : `Save Attendance (${selectedCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
