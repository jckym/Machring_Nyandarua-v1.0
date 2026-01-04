import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Users, FileSpreadsheet, FileText } from 'lucide-react';
import { useFarmers } from '@/hooks/api/useFarmers';
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

export function AttendanceModal({ 
  open, 
  onOpenChange, 
  trainingId, 
  trainingTitle,
  localMrId 
}: AttendanceModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([]);
  
  const { data: farmers = [] } = useFarmers({ localMrId });
  const addAttendees = useAddMultipleAttendees();

  useEffect(() => {
    if (open && farmers.length > 0) {
      setAttendees(farmers.map(f => ({
        farmerId: f.id,
        name: f.name,
        phone: f.phone || '',
        village: f.location?.village || '',
        selected: false,
      })));
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

        <div className="flex items-center justify-between gap-4 py-2">
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

        <div className="flex items-center gap-2 pb-2">
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

        <ScrollArea className="flex-1 max-h-[400px] border rounded-md">
          <div className="p-2 space-y-1">
            {filteredAttendees.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No farmers found</p>
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