'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders, updateOrderVerificationStatus, getOrderById } from '@/services/orders';
import { createPayment } from '@/services/payments';
import { Order } from '@/types';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await getUserOrders(user.id);
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !user) return;

    setIsSubmitting(true);
    try {
      const form = e.target as HTMLFormElement;
      const transactionId = (form.elements.namedItem('txId') as HTMLInputElement).value;
      const screenshotUrl = (form.elements.namedItem('ssUrl') as HTMLInputElement).value;

      // 1. Create a new payment proof
      await createPayment({
        order_id: selectedOrder.id,
        user_id: user.id,
        payment_method: 'Mobile Money',
        transaction_id: transactionId,
        screenshot_url: screenshotUrl,
        status: 'Pending',
      });

      // 2. Update order status
      await updateOrderVerificationStatus(selectedOrder.id, 'Pending Verification', 'Pending Verification');
      
      toast.success('Payment proof submitted successfully! Awaiting verification.');
      
      // Refresh order locally
      const updatedOrder = await getOrderById(selectedOrder.id);
      if (updatedOrder) {
        setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      }
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error submitting proof", error);
      toast.error('Failed to submit payment proof.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending Verification': return 'bg-amber-500 hover:bg-amber-600';
      case 'Delivered': return 'bg-green-500 hover:bg-green-600';
      case 'Rejected': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-primary hover:bg-primary/90';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
      <p className="text-muted-foreground">View and track the status of all your recent orders.</p>

      {orders.length === 0 ? (
        <div className="text-center p-8 bg-card rounded-lg border">
          <p className="text-muted-foreground">You have no orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-6).toUpperCase()}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-bold">${order.total_amount.toFixed(2)}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Payment Status: {order.payment_status}</p>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    
                    {(order.status === 'Rejected' || order.status === 'Pending') && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant={order.status === 'Rejected' ? "destructive" : "default"} onClick={() => setSelectedOrder(order)}>
                            {order.status === 'Rejected' ? 'Resubmit Payment' : 'Submit Payment Proof'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{order.status === 'Rejected' ? 'Resubmit Payment Proof' : 'Submit Payment Proof'}</DialogTitle>
                            <DialogDescription>
                              {order.status === 'Rejected' 
                                ? 'Your previous payment proof was rejected. Please submit a valid transaction ID and screenshot.' 
                                : 'Please provide your transaction ID and a screenshot of your payment receipt.'}
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleResubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="txId">Transaction ID</Label>
                              <Input id="txId" name="txId" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ssUrl">Screenshot URL</Label>
                              <Input id="ssUrl" name="ssUrl" type="url" required />
                            </div>
                            <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                              {isSubmitting ? 'Submitting...' : 'Submit Proof'}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
