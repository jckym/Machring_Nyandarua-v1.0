import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUsers } from "@/hooks/api/useUsers";
import { useLocalMRs } from "@/hooks/api/useLocalMRs";
import { Building2, Users, UserCheck, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const OrgChart = () => {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: localMRs = [], isLoading: localMRsLoading } = useLocalMRs();

  const isLoading = usersLoading || localMRsLoading;

  // Filter users by role
  const managers = users.filter((u: any) => u.role === 'manager');
  const coordinators = users.filter((u: any) => u.role === 'local_mr_coordinator');
  const tots = users.filter((u: any) => u.role === 'tot');

  // Group TOTs by local MR
  const totsByLocalMr = tots.reduce((acc: Record<string, any[]>, tot: any) => {
    const mrId = tot.localMrId || 'unassigned';
    if (!acc[mrId]) acc[mrId] = [];
    acc[mrId].push(tot);
    return acc;
  }, {});

  // Get coordinator's local MR
  const getCoordinatorMR = (coordinatorId: string) => {
    return localMRs.find((mr: any) => mr.coordinator_id === coordinatorId);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-40 w-full max-w-md mx-auto" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Organization Structure</h1>
        <p className="text-muted-foreground">Regional MR Hierarchy</p>
      </div>

      {/* Org Chart Container */}
      <div className="flex flex-col items-center space-y-4">
        
        {/* Level 1: Regional MR / Manager */}
        <div className="relative">
          <Card className="w-72 md:w-80 border-2 border-primary bg-primary/5 shadow-lg">
            <CardHeader className="pb-2 text-center">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-full bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-lg">Regional MR</CardTitle>
              <Badge variant="default" className="w-fit mx-auto">Headquarters</Badge>
            </CardHeader>
            <CardContent className="pt-2">
              {managers.length > 0 ? (
                <div className="space-y-2">
                  {managers.map((manager: any) => (
                    <div key={manager.id} className="flex items-center gap-3 p-2 rounded-lg bg-background">
                      <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {getInitials(manager.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{manager.name}</p>
                        <p className="text-xs text-muted-foreground">Manager</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">No manager assigned</p>
              )}
            </CardContent>
          </Card>
          
          {/* Connector line down */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full h-8 w-0.5 bg-border" />
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-6">
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Level 2: Local MR Coordinators */}
        <div className="relative pt-8 w-full">
          <div className="text-center mb-4">
            <Badge variant="secondary" className="text-sm">
              <Users className="h-3 w-3 mr-1" />
              Local MR Coordinators
            </Badge>
          </div>
          
          {/* Horizontal connector line */}
          {coordinators.length > 1 && (
            <div className="absolute top-16 left-1/4 right-1/4 h-0.5 bg-border hidden md:block" />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {coordinators.length > 0 ? (
              coordinators.map((coordinator: any) => {
                const localMR = getCoordinatorMR(coordinator.id);
                const assignedTots = localMR ? totsByLocalMr[localMR.id] || [] : [];
                
                return (
                  <div key={coordinator.id} className="relative">
                    <Card className="border-2 border-secondary bg-secondary/5 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-secondary">
                            <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                              {getInitials(coordinator.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{coordinator.name}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {localMR?.name || 'Unassigned'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">TOTs Supervised:</span>
                          <Badge variant="secondary">{assignedTots.length}</Badge>
                        </div>
                        
                        {/* TOTs under this coordinator */}
                        {assignedTots.length > 0 && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              Team Members
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {assignedTots.slice(0, 4).map((tot: any) => (
                                <Avatar key={tot.id} className="h-7 w-7 border border-accent">
                                  <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                                    {getInitials(tot.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {assignedTots.length > 4 && (
                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">
                                    +{assignedTots.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })
            ) : (
              <Card className="col-span-full border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No coordinators assigned yet
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Level 3: All TOTs Summary */}
        <div className="w-full pt-6">
          <div className="text-center mb-4">
            <Badge variant="outline" className="text-sm">
              <UserCheck className="h-3 w-3 mr-1" />
              Trainers of Trainers (TOTs)
            </Badge>
          </div>
          
          <Card className="max-w-4xl mx-auto border-2 border-accent/50 bg-accent/5">
            <CardContent className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{tots.length}</p>
                  <p className="text-sm text-muted-foreground">Total TOTs</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-secondary">
                    {tots.filter((t: any) => t.localMrId).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Assigned</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent-foreground">
                    {tots.filter((t: any) => !t.localMrId).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {tots.filter((t: any) => t.status === 'active').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
              
              {/* TOT Avatars */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex flex-wrap justify-center gap-2">
                  {tots.slice(0, 12).map((tot: any) => (
                    <div key={tot.id} className="group relative">
                      <Avatar className="h-10 w-10 border-2 border-background hover:border-primary transition-colors cursor-pointer">
                        <AvatarFallback className="bg-accent text-accent-foreground font-medium">
                          {getInitials(tot.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {tot.name}
                        <div className="text-muted-foreground">{tot.localMrName || 'Unassigned'}</div>
                      </div>
                    </div>
                  ))}
                  {tots.length > 12 && (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                      <span className="text-sm font-medium text-muted-foreground">
                        +{tots.length - 12}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 pt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary" />
          <span className="text-muted-foreground">Regional MR (Manager)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary/20 border-2 border-secondary" />
          <span className="text-muted-foreground">Local MR (Coordinator)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent/20 border-2 border-accent" />
          <span className="text-muted-foreground">TOT</span>
        </div>
      </div>
    </div>
  );
};

export default OrgChart;
