import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Download, Eye, Edit, Trash2, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  entity: string;
  entityId: string;
  description: string;
  userId: string;
  userName: string;
  ipAddress: string;
}

const mockAuditLogs: AuditEntry[] = [
  { id: '1', timestamp: '2024-01-15 14:32:15', action: 'create', entity: 'Farmer', entityId: 'F001', description: 'Created new farmer: John Doe', userId: '3', userName: 'Mike TOT', ipAddress: '192.168.1.100' },
  { id: '2', timestamp: '2024-01-15 14:30:00', action: 'update', entity: 'Sale', entityId: 'S001', description: 'Updated sale status to Completed', userId: '3', userName: 'Mike TOT', ipAddress: '192.168.1.100' },
  { id: '3', timestamp: '2024-01-15 14:25:30', action: 'delete', entity: 'Training', entityId: 'T005', description: 'Deleted training session', userId: '2', userName: 'Jane Manager', ipAddress: '192.168.1.101' },
  { id: '4', timestamp: '2024-01-15 14:20:00', action: 'view', entity: 'Report', entityId: 'R001', description: 'Viewed monthly sales report', userId: '1', userName: 'John Admin', ipAddress: '192.168.1.102' },
  { id: '5', timestamp: '2024-01-15 14:15:00', action: 'export', entity: 'Farmers', entityId: '-', description: 'Exported farmers list to Excel', userId: '2', userName: 'Jane Manager', ipAddress: '192.168.1.101' },
  { id: '6', timestamp: '2024-01-15 14:10:00', action: 'update', entity: 'User', entityId: 'U004', description: 'Updated user permissions', userId: '1', userName: 'John Admin', ipAddress: '192.168.1.102' },
  { id: '7', timestamp: '2024-01-15 14:05:00', action: 'create', entity: 'Branch', entityId: 'B006', description: 'Created new branch: Meru Branch', userId: '1', userName: 'John Admin', ipAddress: '192.168.1.102' },
  { id: '8', timestamp: '2024-01-15 14:00:00', action: 'view', entity: 'Farmer', entityId: 'F025', description: 'Viewed farmer profile: Jane Smith', userId: '3', userName: 'Mike TOT', ipAddress: '192.168.1.100' },
];

export function AuditLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [auditLogs] = useState<AuditEntry[]>(mockAuditLogs);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="h-4 w-4 text-green-500" />;
      case 'update': return <Edit className="h-4 w-4 text-blue-500" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'view': return <Eye className="h-4 w-4 text-gray-500" />;
      case 'export': return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-500',
      update: 'bg-blue-500',
      delete: 'bg-red-500',
      view: 'bg-gray-500',
      export: 'bg-purple-500',
    };
    return <Badge className={colors[action]}>{action.toUpperCase()}</Badge>;
  };

  const handleExportAudit = () => {
    toast.success('Audit log exported successfully');
  };

  const entities = [...new Set(auditLogs.map(l => l.entity))];

  // Stats
  const createCount = auditLogs.filter(l => l.action === 'create').length;
  const updateCount = auditLogs.filter(l => l.action === 'update').length;
  const deleteCount = auditLogs.filter(l => l.action === 'delete').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground">Track all user actions and changes</p>
        </div>
        <Button variant="outline" onClick={handleExportAudit}>
          <Download className="mr-2 h-4 w-4" />
          Export Audit Log
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Actions</p>
              <p className="text-2xl font-bold">{auditLogs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <Plus className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Creates</p>
              <p className="text-2xl font-bold">{createCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <Edit className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Updates</p>
              <p className="text-2xl font-bold">{updateCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-red-500/10 p-3">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deletes</p>
              <p className="text-2xl font-bold">{deleteCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="export">Export</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entities.map(entity => (
                  <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{getActionIcon(log.action)}</TableCell>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{log.description}</TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
