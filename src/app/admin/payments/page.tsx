'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { getAllPayments, updatePaymentStatus } from '@/services/payments';
import { updateOrderPaymentStatus, updateOrderVerificationStatus, getOrderById } from '@/services/orders';
import { Payment } from '@/types';

export default function PaymentVerificationPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      setIsLoading(true);
      try {
        const data = await getAllPayments();
        // Only show pending payments for review
        setPayments(data.filter(p => p.status === 'Pending'));
      } catch (error) {
        console.error("Failed to load payments", error);
        toast.error("Failed to load payments");
      } finally {
        setIsLoading(false);
      }
    }
    loadPayments();
  }, []);

  const handleApprove = async (id: string) => {
    if (!selectedPayment) return;
    try {
      await updatePaymentStatus(id, 'Approved');
      
      // Update order status to Paid
      await updateOrderPaymentStatus(selectedPayment.order_id, 'Paid', 'Paid');
      await updateOrderVerificationStatus(selectedPayment.order_id, 'Approved');

      setPayments(payments.filter(p => p.id !== id));
      toast.success(`Payment for order ${selectedPayment.order_id} approved successfully.`);
      setSelectedPayment(null);
    } catch (error) {
      console.error("Approval failed", error);
      toast.error("Failed to approve payment");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    if (!selectedPayment) return;

    try {
      await updatePaymentStatus(selectedPayment.id, 'Rejected', rejectReason);
      
      // Order Verification Status is updated to Rejected
      // Also potentially order status back to Pending
      await updateOrderVerificationStatus(selectedPayment.order_id, 'Rejected', 'Rejected');

      setPayments(payments.filter(p => p.id !== selectedPayment.id));
      toast.success('Payment rejected. Customer will be notified to resubmit.');
      setIsRejectModalOpen(false);
      setSelectedPayment(null);
      setRejectReason('');
    } catch (error) {
      console.error("Rejection failed", error);
      toast.error("Failed to reject payment");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Verification</h1>
        <p className="text-muted-foreground mt-1">Review and approve customer payment proofs.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Payment List */}
        <div className="xl:col-span-1 space-y-4">
          {payments.length === 0 ? (
            <div className="text-center p-8 bg-card rounded-lg border">
              <Check className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium">All caught up!</h3>
              <p className="text-muted-foreground text-sm">No pending payments to verify.</p>
            </div>
          ) : (
            payments.map(payment => (
              <Card 
                key={payment.id} 
                className={`cursor-pointer transition-colors hover:border-primary ${selectedPayment?.id === payment.id ? 'border-primary ring-1 ring-primary' : ''}`}
                onClick={() => setSelectedPayment(payment)}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{payment.order_id}</p>
                    <p className="text-xs text-muted-foreground">{payment.user_id}</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                    Review
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Verification Details Panel */}
        <div className="xl:col-span-2">
          {selectedPayment ? (
            <Card className="h-full">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Verify Payment for {selectedPayment.order_id}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Submitted on {new Date(selectedPayment.created_at).toLocaleString()}</p>
                  </div>
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Transaction Details</h4>
                      <div className="bg-muted p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">User ID:</span>
                          <span className="font-medium text-xs">{selectedPayment.user_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Method:</span>
                          <span className="font-medium text-xs">{selectedPayment.payment_method}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="text-sm text-muted-foreground">Transaction ID:</span>
                          <span className="font-mono bg-background px-2 py-1 rounded text-primary font-bold">
                            {selectedPayment.transaction_id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                        size="lg"
                        onClick={() => handleApprove(selectedPayment.id)}
                      >
                        <Check className="mr-2 h-5 w-5" /> Approve Payment
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="destructive" 
                        size="lg"
                        onClick={() => setIsRejectModalOpen(true)}
                      >
                        <X className="mr-2 h-5 w-5" /> Reject
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Screenshot Proof</h4>
                      <a
                        href={selectedPayment.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" /> View Full
                      </a>
                    </div>
                    <div className="relative aspect-[3/4] bg-muted rounded-lg border overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={selectedPayment.screenshot_url} 
                        alt="Payment Proof" 
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center border rounded-lg bg-muted/5">
              <p className="text-muted-foreground">Select a payment from the list to review</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment proof. The customer will see this message and be asked to resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea 
                id="reason" 
                placeholder="e.g. The Transaction ID does not match the screenshot provided."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectSubmit}>Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
