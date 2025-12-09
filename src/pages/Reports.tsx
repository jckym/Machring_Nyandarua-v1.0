import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Users, 
  ShoppingCart, 
  Tractor, 
  GraduationCap, 
  TrendingUp,
  Calendar,
  Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const reportTypes = [
  {
    id: 'sales',
    title: 'Sales Report',
    description: 'Detailed breakdown of all sales transactions, revenue, and commissions',
    icon: ShoppingCart,
    color: 'forest',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'farmers',
    title: 'Farmer Profiles',
    description: 'Complete farmer registry with contact details and activity history',
    icon: Users,
    color: 'wheat',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'mechanisation',
    title: 'Mechanisation Report',
    description: 'Summary of all machinery service bookings and completion status',
    icon: Tractor,
    color: 'earth',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'trainings',
    title: 'Training Report',
    description: 'Capacity building sessions, attendance records, and topics covered',
    icon: GraduationCap,
    color: 'forest',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'performance',
    title: 'Performance Report',
    description: 'TOT performance metrics, targets achieved, and areas for improvement',
    icon: TrendingUp,
    color: 'wheat',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'commission',
    title: 'Commission Report',
    description: 'Detailed commission earnings breakdown by product and period',
    icon: FileText,
    color: 'earth',
    formats: ['PDF', 'Excel'],
  },
];

const managerReports = [
  {
    id: 'branch',
    title: 'Branch Performance',
    description: 'Comprehensive branch-level analytics and metrics',
    icon: Building2,
    color: 'forest',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'tot-comparison',
    title: 'TOT Comparison',
    description: 'Side-by-side comparison of all TOTs in your branch',
    icon: Users,
    color: 'wheat',
    formats: ['PDF', 'Excel'],
  },
];

export function Reports() {
  const { user } = useAuth();
  
  const allReports = user?.role === 'manager' || user?.role === 'admin' 
    ? [...reportTypes, ...managerReports] 
    : reportTypes;

  const getColorClass = (color: string) => {
    switch (color) {
      case 'forest':
        return 'bg-primary text-primary-foreground';
      case 'wheat':
        return 'bg-accent text-accent-foreground';
      case 'earth':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and download operational reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Select Date Range
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <Card variant="gradient" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-semibold mb-1">Monthly Summary</h3>
            <p className="text-sm opacity-80">December 2024 report overview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold font-heading">45</p>
              <p className="text-xs opacity-70">Sales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-heading">12</p>
              <p className="text-xs opacity-70">Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-heading">28</p>
              <p className="text-xs opacity-70">Farmers</p>
            </div>
            <Button variant="outline" className="bg-primary-foreground/20 border-primary-foreground/30 hover:bg-primary-foreground/30">
              <Download className="w-4 h-4 mr-2" />
              Quick Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allReports.map((report, index) => (
          <Card 
            key={report.id}
            variant="elevated"
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClass(report.color)}`}>
                  <report.icon className="w-6 h-6" />
                </div>
                <div className="flex gap-1">
                  {report.formats.map(format => (
                    <Badge key={format} variant="outline" className="text-xs">{format}</Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-1">{report.title}</CardTitle>
              <CardDescription className="text-sm mb-4">{report.description}</CardDescription>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button variant="forest" size="sm" className="flex-1">
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Downloads */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">Recent Downloads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Sales Report - November 2024', type: 'PDF', date: 'Dec 1, 2024' },
              { name: 'Farmer Profiles - Q4 2024', type: 'Excel', date: 'Nov 28, 2024' },
              { name: 'Commission Report - October 2024', type: 'PDF', date: 'Nov 15, 2024' },
            ].map((download, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{download.name}</p>
                    <p className="text-xs text-muted-foreground">{download.date}</p>
                  </div>
                </div>
                <Badge variant="outline">{download.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
