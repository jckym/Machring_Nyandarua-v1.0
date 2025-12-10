import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Camera,
  Save,
  RefreshCw,
} from 'lucide-react';

export function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    dailyDigest: false,
    language: 'en',
    timezone: 'Africa/Nairobi',
    theme: 'system',
    compactMode: false,
  });

  // Security state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully');
  };

  const handleChangePassword = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (securityData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully');
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex md:flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="profile" className="flex items-center gap-2 text-xs md:text-sm">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs md:text-sm">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 text-xs md:text-sm">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 text-xs md:text-sm">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {user?.name?.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Camera className="w-4 h-4" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 2MB</p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Badge variant={user?.role === 'admin' ? 'terracotta' : user?.role === 'manager' ? 'wheat' : 'sage'}>
                      {user?.role?.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Contact admin to change</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to receive updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Notifications
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Weekly Reports</p>
                      <p className="text-xs text-muted-foreground">Get weekly summary of activities</p>
                    </div>
                    <Switch
                      checked={preferences.weeklyReports}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReports: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Daily Digest</p>
                      <p className="text-xs text-muted-foreground">Receive daily activity summary</p>
                    </div>
                    <Switch
                      checked={preferences.dailyDigest}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, dailyDigest: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Push Notifications */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Push Notifications
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive push notifications on this device</p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">SMS Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive important alerts via SMS</p>
                    </div>
                    <Switch
                      checked={preferences.smsNotifications}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, smsNotifications: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePreferences} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize how the application looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Compact Mode</p>
                    <p className="text-xs text-muted-foreground">Use smaller spacing and fonts</p>
                  </div>
                  <Switch
                    checked={preferences.compactMode}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, compactMode: checked })}
                  />
                </div>
              </div>

              <Separator />

              {/* Language & Region */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language & Region
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="sw">Swahili</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={preferences.timezone}
                      onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Nairobi">East Africa Time (EAT)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePreferences} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Additional security options for your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active Sessions</p>
                  <p className="text-xs text-muted-foreground">Manage your active login sessions</p>
                </div>
                <Button variant="outline" size="sm">View Sessions</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Login History</p>
                  <p className="text-xs text-muted-foreground">View your recent login activity</p>
                </div>
                <Button variant="outline" size="sm">View History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
