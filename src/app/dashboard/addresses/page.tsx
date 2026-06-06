'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '@/services/addresses';
import { Address } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Edit2, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type AddressForm = Omit<Address, 'id' | 'user_id'>;
const EMPTY_FORM: AddressForm = { country: '', city: '', district: '', street: '' };

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await getAddresses(user.id);
        setAddresses(data);
      } catch {
        toast.error('Failed to load addresses');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({ country: addr.country, city: addr.city, district: addr.district, street: addr.street });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      if (editing) {
        await updateAddress(editing.id, form);
        setAddresses((prev) =>
          prev.map((a) => (a.id === editing.id ? { ...a, ...form } : a))
        );
        toast.success('Address updated!');
      } else {
        const id = await addAddress({ ...form, user_id: user.id });
        setAddresses((prev) => [...prev, { id, user_id: user.id, ...form }]);
        toast.success('Address added!');
      }
      setDialogOpen(false);
    } catch {
      toast.error('Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading addresses…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Addresses</h1>
          <p className="text-muted-foreground mt-1">Manage your shipping addresses.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />} onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District / State</Label>
                <Input
                  id="district"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  required
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                  ) : (
                    editing ? 'Update Address' : 'Save Address'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 border rounded-2xl bg-card">
          <MapPin className="w-16 h-16 text-muted-foreground/30" />
          <p className="text-muted-foreground text-lg font-medium">No addresses saved yet</p>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" /> Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr, idx) => (
            <Card key={addr.id} className={`relative ${idx === 0 ? 'border-primary shadow-sm' : ''}`}>
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Default
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Address {idx + 1}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-0.5 text-sm mt-1">
                  <p className="text-foreground">{addr.street}</p>
                  <p className="text-muted-foreground">{addr.district && `${addr.district}, `}{addr.city}</p>
                  <p className="text-muted-foreground">{addr.country}</p>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(addr)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    onClick={() => handleDelete(addr.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
