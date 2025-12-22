import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  MoreHorizontal,
  Building2,
  Users,
  MapPin,
  UserCog,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useLocalMRs,
  useCreateLocalMR,
  useUpdateLocalMR,
} from '@/hooks/api';
import { LocalMR } from '@/types';

export function LocalMRs() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [subcountyFilter, setSubcountyFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMR, setSelectedMR] = useState<LocalMR | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    subcounty: '',
    ward: '',
    managerName: '',
  });

  /** ================= API ================= */
  const { data: localMRs = [], isLoading } = useLocalMRs();
  const createMR = useCreateLocalMR();
  const updateMR = useUpdateLocalMR();

  /** ================= FILTERS ================= */
  const subcounties = [...new Set(localMRs.map(mr => mr.subcounty))];
  const wards = [...new Set(localMRs.map(mr => mr.ward))];

  const filteredMRs = localMRs.filter(mr => {
    const matchesSearch =
      mr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mr.subcounty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mr.ward.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesSearch &&
      (subcountyFilter === 'all' || mr.subcounty === subcountyFilter) &&
      (wardFilter === 'all' || mr.ward === wardFilter)
    );
  });

  /** ================= HELPERS ================= */
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      subcounty: '',
      ward: '',
      managerName: '',
    });
  };

  /** ================= ACTIONS ================= */
  const handleAddMR = () => {
    if (!formData.name || !formData.code || !formData.subcounty || !formData.ward) {
      toast.error('Please fill all required fields');
      return;
    }

    createMR.mutate(
      {
        name: formData.name,
        code: formData.code,
        subcounty: formData.subcounty,
        ward: formData.ward,
        managerName: formData.managerName,
      },
      {
        onSuccess: () => {
          toast.success('Local MR created');
          setIsAddDialogOpen(false);
          resetForm();
        },
      }
    );
  };

  const handleUpdateMR = () => {
    if (!selectedMR) return;

    updateMR.mutate(
      {
        id: selectedMR.id,
        data: formData,
      },
      {
        onSuccess: () => {
          toast.success('Local MR updated');
          setIsEditDialogOpen(false);
          setSelectedMR(null);
          resetForm();
        },
      }
    );
  };

  const handleViewDetails = (id: string) => {
    navigate(`/local-mrs/${id}`);
  };

  /** ================= STATS ================= */
  const totalMRs = localMRs.length;
  const totalTOTs = localMRs.reduce((s, m) => s + m.totalTots, 0);
  const totalFarmers = localMRs.reduce((s, m) => s + m.totalFarmers, 0);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading Local MRs…</p>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Local MR Management</h1>
          <p className="text-muted-foreground">MongoDB-powered registry</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Local MR
        </Button>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Building2} label="Local MRs" value={totalMRs} />
        <Stat icon={MapPin} label="Subcounties" value={subcounties.length} />
        <Stat icon={UserCog} label="TOTs" value={totalTOTs} />
        <Stat icon={Users} label="Farmers" value={totalFarmers.toLocaleString()} />
      </div>

      {/* SEARCH */}
      <Input
        placeholder="Search Local MRs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Local MRs ({filteredMRs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subcounty</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>TOTs</TableHead>
                <TableHead>Farmers</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMRs.map(mr => (
                <TableRow key={mr.id}>
                  <TableCell><Badge variant="outline">{mr.code}</Badge></TableCell>
                  <TableCell>{mr.name}</TableCell>
                  <TableCell>{mr.subcounty}</TableCell>
                  <TableCell>{mr.ward}</TableCell>
                  <TableCell>{mr.managerName}</TableCell>
                  <TableCell>{mr.totalTots}</TableCell>
                  <TableCell>{mr.totalFarmers}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(mr.id)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedMR(mr);
                          setFormData({
                            name: mr.name,
                            code: mr.code,
                            subcounty: mr.subcounty,
                            ward: mr.ward,
                            managerName: mr.managerName,
                          });
                          setIsEditDialogOpen(true);
                        }}>
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD & EDIT DIALOGS — unchanged from your UI */}
    </div>
  );
}

/** SMALL STAT CARD */
function Stat({ icon: Icon, label, value }: any) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
