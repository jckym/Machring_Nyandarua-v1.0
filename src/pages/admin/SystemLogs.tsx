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
import { Search, Download, AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  module: string;
  message: string;
  userId?: string;
  userName?: string;
}

const mockLogs: SystemLog[] = [
  { id: '1', timestamp: '2024-01-15 14:32:15', level: 'info', module: 'Auth', message: 'User login successful', userId: '1', userName: 'John Admin' },
  { id: '2', timestamp: '2024-01-15 14:30:00', level: 'success', module: 'Sales', message: 'New sale recorded - KES 15,000', userId: '3', userName: 'Mike TOT' },
  { id: '3', timestamp: '2024-01-15 14:25:30', level: 'warning', module: 'Database', message: 'High query response time detected', userId: undefined, userName: undefined },
  { id: '4', timestamp: '2024-01-15 14:20:00', level: 'error', module: 'API', message: 'Failed to sync with external service', userId: undefined, userName: undefined },
  { id: '5', timestamp: '2024-01-15 14:15:00', level: 'info', module: 'Farmers', message: 'New farmer registered', userId: '3', userName: 'Mike TOT' },
  { id: '6', timestamp: '2024-01-15 14:10:00', level: 'success', module: 'Training', message: 'Training session completed', userId: '2', userName: 'Jane Manager' },
  { id: '7', timestamp: '2024-01-15 14:05:00', level: 'warning', module: 'Storage', message: 'Storage usage at 80%', userId: undefined, userName: undefined },
  { id: '8', timestamp: '2024-01-15 14:00:00', level: 'info', module: 'Auth', message: 'User logout', userId: '4', userName: 'Sarah TOT' },
];

export function SystemLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [logs] = useState<SystemLog[]>(mockLogs);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userName?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesLevel && matchesModule;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      info: 'bg-blue-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      success: 'bg-green-500',
    };
    return <Badge className={colors[level]}>{level.toUpperCase()}</Badge>;
  };

  const handleExportLogs = () => {
    toast.success('Logs exported successfully');
  };

  const modules = [...new Set(logs.map(l => l.module))];

  // Stats
  const errorCount = logs.filter(l => l.level === 'error').length;
  const warningCount = logs.filter(l => l.level === 'warning').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">System Logs</h1>
          <p className="text-muted-foreground">Monitor system activity and events</p>
        </div>
        <Button variant="outline" onClick={handleExportLogs}>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <Info className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Logs</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-red-500/10 p-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold">{errorCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-yellow-500/10 p-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold">{warningCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Success</p>
              <p className="text-2xl font-bold">{logs.filter(l => l.level === 'success').length}</p>
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
                placeholder="Search logs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map(module => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{getLevelIcon(log.level)}</TableCell>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell>{getLevelBadge(log.level)}</TableCell>
                  <TableCell>{log.module}</TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell>{log.userName || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
