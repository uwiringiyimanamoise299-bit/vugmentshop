'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CreditCard, UploadCloud, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/services/orders';
import { createPayment } from '@/services/payments';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getCartTotal, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + tax + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to place an order.');
      router.push('/login');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Get form values directly from the event
      const form = e.target as HTMLFormElement;
      const transactionId = (form.elements.namedItem('transactionId') as HTMLInputElement).value;
      const screenshotUrl = (form.elements.namedItem('screenshotUrl') as HTMLInputElement).value;

      // 1. Create the order
      const orderId = await createOrder({
        user_id: user.id,
        total_amount: total,
        status: 'Pending Verification',
        payment_status: 'Pending',
        verification_status: 'Pending',
      });

      // 2. Create the payment proof
      await createPayment({
        order_id: orderId,
        user_id: user.id,
        payment_method: 'Mobile Money',
        transaction_id: transactionId,
        screenshot_url: screenshotUrl,
        status: 'Pending',
      });

      setIsSuccess(true);
      clearCart();
      toast.success('Order placed successfully! Awaiting verification.');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">Order Received!</h1>
          <p className="text-lg text-muted-foreground text-center max-w-lg mb-8">
            Thank you for your purchase. Your order is currently <span className="font-semibold text-foreground">Pending Verification</span>. We will review your payment screenshot and update the order status shortly.
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard/orders">View Order Status</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button asChild><Link href="/products">Go to Products</Link></Button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-10 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Details */}
                <div className="bg-card rounded-2xl border shadow-sm p-6 sm:p-8">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="flex h-8 w-8 rounded-full bg-primary text-primary-foreground items-center justify-center text-sm">1</span>
                    Shipping Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input id="address" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District / State</Label>
                      <Input id="district" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" required defaultValue="Rwanda" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" required />
                    </div>
                  </div>
                </div>

                {/* Payment Proof Submission */}
                <div className="bg-card rounded-2xl border shadow-sm p-6 sm:p-8">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="flex h-8 w-8 rounded-full bg-primary text-primary-foreground items-center justify-center text-sm">2</span>
                    Payment Verification
                  </h2>
                  <div className="bg-muted p-4 rounded-lg mb-6 border border-border">
                    <h3 className="font-medium text-lg mb-2">Instructions</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Please send the total amount of <strong className="text-foreground">${total.toFixed(2)}</strong> to the following number:
                    </p>
                    <div className="bg-background p-3 rounded border font-mono text-lg text-center font-bold tracking-wider text-primary">
                      *182*1*1*0795552517#
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      After completing the payment, please upload a screenshot of the confirmation SMS or receipt, and enter the Transaction ID below.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="transactionId">Transaction ID <span className="text-red-500">*</span></Label>
                      <Input id="transactionId" placeholder="e.g. 1234567890" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="screenshotUrl">Payment Screenshot URL <span className="text-red-500">*</span></Label>
                      <Input id="screenshotUrl" placeholder="https://example.com/screenshot.jpg" type="url" required />
                      <p className="text-xs text-muted-foreground">Upload your image to an image host (like Imgur) and paste the direct link here.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea id="notes" placeholder="Any special instructions for delivery..." className="resize-none" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border shadow-sm p-6 sticky top-24">
                <h3 className="text-xl font-semibold mb-6 pb-4 border-b">Order Summary</h3>
                
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="relative w-16 h-16 rounded bg-muted flex-shrink-0 overflow-hidden">
                        {item.image_urls[0] && <Image src={item.image_urls[0]} alt={item.name} fill className="object-cover" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-muted-foreground">Qty: {item.cartQuantity}</span>
                          <span className="text-sm font-semibold">${((item.discount_price || item.price) * item.cartQuantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 mb-6 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-8 pt-4 border-t">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>
                
                <Button 
                  type="submit" 
                  form="checkout-form"
                  className="w-full text-lg h-14 rounded-xl" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
