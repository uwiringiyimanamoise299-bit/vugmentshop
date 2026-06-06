'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { Button } from '@/components/ui/button';
import { MOCK_CATEGORIES } from '@/lib/mock-data';
import { getProducts } from '@/services/products';
import { Product } from '@/types';
import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((data) => setFeaturedProducts(data.slice(0, 4))) // show latest 4
      .catch(() => setFeaturedProducts([]))
      .finally(() => setIsLoading(false));
  }, []);
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden bg-black">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920')" }}
          />
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <span className="text-primary font-bold tracking-wider uppercase mb-4 drop-shadow-md">New Collection 2026</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg max-w-4xl">
              Elevate Your Lifestyle with Premium Goods
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl drop-shadow">
              Discover our curated selection of high-end electronics, modern fashion, and sophisticated accessories designed for the modern trendsetter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full" asChild>
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full bg-white/10 text-white border-white hover:bg-white hover:text-black transition-colors" asChild>
                <Link href="/products?sort=trending">Explore Trending</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features/Trust Banners */}
        <section className="border-b bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x">
              <div className="flex flex-col items-center gap-3 pt-6 md:pt-0 px-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">Free Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">Free shipping on all orders over $200</p>
              </div>
              <div className="flex flex-col items-center gap-3 pt-6 md:pt-0 px-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">100% secure payment processing</p>
              </div>
              <div className="flex flex-col items-center gap-3 pt-6 md:pt-0 px-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">Easy Returns</h3>
                <p className="text-sm text-muted-foreground">30-day return policy for any reason</p>
              </div>
            </div>
          </div>
        </section>

        {/* Shop by Categories */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Shop by Category</h2>
                <p className="text-muted-foreground">Find exactly what you're looking for</p>
              </div>
              <Button variant="ghost" className="hidden sm:flex gap-2" asChild>
                <Link href="/categories">View All <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MOCK_CATEGORIES.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Products</h2>
                <p className="text-muted-foreground">Our top picks for the season</p>
              </div>
              <Button variant="ghost" className="hidden sm:flex gap-2" asChild>
                <Link href="/products">Shop All <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="col-span-4 flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-4 text-center py-16 text-muted-foreground">
                  No products yet. Add some from the admin panel!
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Promotional Banner */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden bg-primary/10 border p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Summer Sale!</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Get up to 40% off on our latest summer collection. Limited time offer, don't miss out!
                </p>
                <Button size="lg" className="rounded-full">Shop the Sale</Button>
              </div>
              {/* Add abstract decorative shapes here if needed */}
              <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none" 
                   style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}></div>
            </div>
          </div>
        </section>

        {/* Newsletter Subscription */}
        <section className="py-16 border-t mt-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
              <p className="text-muted-foreground mb-8">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
              <form className="flex gap-2 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
                <Button type="submit">Subscribe</Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
