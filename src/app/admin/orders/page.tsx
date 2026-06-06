'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getAllOrders, updateOrderStatus } from '@/services/orders';
import { Order } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending Verification': return 'bg-amber-500 text-white';
      case 'Pending': return 'bg-yellow-500 text-white';
      case 'Paid': return 'bg-blue-500 text-white';
      case 'Processing': return 'bg-indigo-500 text-white';
      case 'Shipped': return 'bg-purple-500 text-white';
      case 'Delivered': return 'bg-green-500 text-white';
      case 'Cancelled': 
      case 'Rejected': return 'bg-red-500 text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground mt-1">Manage and update customer orders.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-lg border">
            <p className="text-muted-foreground text-sm">No orders found.</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold">#{order.id.slice(-8).toUpperCase()}</span>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Date: {new Date(order.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    User ID: <span className="font-mono text-xs">{order.user_id}</span>
                  </p>
                </div>
                
                <div className="text-left md:text-right flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-primary">${order.total_amount.toFixed(2)}</p>
                </div>

                <div className="flex-1 w-full md:w-auto">
                  <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                  <Select 
                    value={order.status} 
                    onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Pending Verification">Pending Verification</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
