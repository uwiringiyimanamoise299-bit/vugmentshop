'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate save
    setTimeout(() => {
      toast.success('Settings saved successfully!');
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your store preferences and administrative settings.</p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Store Details Section */}
          <div className="border rounded-lg bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Store Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input id="storeName" defaultValue="VogueMart Premium" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" type="email" defaultValue="support@voguemart.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeAddress">Business Address</Label>
              <Input id="storeAddress" defaultValue="123 Fashion Ave, New York, NY 10001" />
            </div>
          </div>

          {/* Payment & Currency Section */}
          <div className="border rounded-lg bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Payment & Localization</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Input id="currency" defaultValue="USD ($)" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                <Input id="taxRate" type="number" defaultValue="8.5" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
