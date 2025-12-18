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
    if (sales > 0 && commissionRate > 0) {
      const calculated = (sales * commissionRate) / 100;
      setCommission(calculated);
    } else {
      setCommission(0);
    }
  };

  const downloadReport = () => {
    if (!totName.trim()) {
      alert('Please enter a TOT Name before downloading.');
      return;
    }

    const reportData = `
TOT COMMISSION REPORT
=======================
TOT Name: ${totName}
Total Sales: KES ${sales.toLocaleString()}
Commission Rate: ${commissionRate}%
Total Commission: KES ${commission.toFixed(2)}

Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([reportData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${totName.replace(/\s+/g, '_')}_commission_report.txt`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Commission Calculator
        </h1>
        <p className="text-muted-foreground">
          Calculate the commission of TOTs based on sales and product commission rate
        </p>
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
            <Label htmlFor="sales">Total Sales (KES)</Label>
            <Input
              id="sales"
              type="number"
              placeholder="e.g. 50000"
              min="0"
              value={sales || ''}
              onChange={(e) => setSales(Number(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commissionRate">Commission Rate (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              placeholder="e.g. 5"
              min="0"
              max="100"
              step="0.1"
              value={commissionRate || ''}
              onChange={(e) => setCommissionRate(Number(e.target.value) || 0)}
            />
          </div>

          <Button onClick={calculateCommission} className="w-full">
            Calculate Commission
          </Button>

          {commission > 0 && (
            <div className="rounded-lg bg-green-50 p-4 text-center border border-green-200">
              <p className="text-2xl font-bold text-green-800">
                KES {commission.toFixed(2)}
              </p>
              <p className="text-sm text-green-700 mt-1">Total Commission Earned</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={downloadReport}
          disabled={!totName || commission === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>
    </div>
  );
}
