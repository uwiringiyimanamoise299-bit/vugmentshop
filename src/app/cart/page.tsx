'use client';

import { useCartStore } from '@/store/cart';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCartStore();

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1; // 10% tax for example
  const shipping = subtotal > 200 ? 0 : 15; // Free shipping over 200
  const total = subtotal + tax + shipping;

  return (
    <>
      <Navbar />
      <main className="flex-1 py-10 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border shadow-sm text-center">
              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Trash2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Looks like you haven't added anything to your cart yet. Browse our products and find something you love.
              </p>
              <Button size="lg" asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const price = item.discount_price || item.price;
                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 p-4 sm:p-6 bg-card rounded-2xl border shadow-sm">
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.image_urls[0] ? (
                          <Image src={item.image_urls[0]} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">No Image</div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col w-full text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-2 gap-2">
                          <div>
                            <Link href={`/products/${item.slug}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                              {item.name}
                            </Link>
                            <span className="text-sm text-muted-foreground">{item.brand || 'VogueMart'}</span>
                          </div>
                          <span className="font-bold text-lg">${(price * item.cartQuantity).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 sm:pt-0">
                          <div className="flex items-center border rounded-md overflow-hidden h-9 bg-background">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.cartQuantity - 1))}
                              className="px-3 text-muted-foreground hover:bg-muted h-full flex items-center"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-10 text-center text-sm font-medium">{item.cartQuantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.cartQuantity + 1)} // Check stock in real app
                              className="px-3 text-muted-foreground hover:bg-muted h-full flex items-center"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl border shadow-sm p-6 sticky top-24">
                  <h3 className="text-xl font-semibold mb-6 pb-4 border-b">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Tax (10%)</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <Input placeholder="Promo code" className="bg-background" />
                      <Button variant="outline">Apply</Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-6 pt-4 border-t">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                  </div>
                  
                  <Button size="lg" className="w-full text-lg h-14 rounded-xl" asChild>
                    <Link href="/checkout">
                      Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span>🔒 Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
