import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';

export function CommissionCalculator() {
  const [totName, setTotName] = useState('');
  const [sales, setSales] = useState(0);
  const [commissionRate, setCommissionRate] = useState(0);
  const [commission, setCommission] = useState(0);

  const calculateCommission = () => {
    const calculatedCommission = (sales * commissionRate) / 100;
    setCommission(calculatedCommission);
  };

  const downloadReport = () => {
    const reportData = `TOT Name: ${totName}\nTotal Sales: ${sales}\nCommission Rate: ${commissionRate}%\nTotal Commission: ${commission}`;
    const blob = new Blob([reportData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${totName}_commission_report.txt`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Commission Calculator</h1>
        <p className="text-muted-foreground">Calculate the commission of TOTs based on sales and product commission rate</p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">Commission Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totName">TOT Name</Label>
            <Input
              id="totName"
              type="text"
              placeholder="Enter TOT Name"
              value={totName}
              onChange={(e) => setTotName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales">Total Sales</Label>
            <Input
              id="sales"
              type="number"
              placeholder="Enter total sales"
              value={sales}
              onChange={(e) => setSales(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commissionRate">Commission Rate (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              placeholder="Enter commission rate"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
            />
          </div>

          <Button onClick={calculateCommission} className="w-full">Calculate</Button>

          {commission > 0 && (
            <div className="text-center mt-4">
              <p className="text-lg font-medium">Total Commission: KES {commission.toFixed(2)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={downloadReport}>
          <Download className="mr-2 w-4 h-4" />
          Download Report
        </Button>
      </div>
    </div>
  );
}
