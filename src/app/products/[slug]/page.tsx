'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MOCK_CATEGORIES } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import { Star, Minus, Plus, ShoppingCart, Heart, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProductBySlug } from '@/services/products';
import { Product } from '@/types';

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        if (typeof slug === 'string') {
          const fetchedProduct = await getProductBySlug(slug);
          setProduct(fetchedProduct);
        }
      } catch (error) {
        console.error("Failed to load product", error);
        toast.error("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button asChild><Link href="/products">Back to Products</Link></Button>
        </div>
        <Footer />
      </>
    );
  }

  const isDiscounted = product.discount_price && product.discount_price < product.price;
  const currentPrice = product.discount_price || product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 py-8 bg-muted/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to products
          </Link>

          <div className="bg-card border rounded-2xl overflow-hidden p-6 md:p-8 lg:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Product Gallery */}
              <div className="flex flex-col gap-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border">
                  {isDiscounted && (
                    <Badge className="absolute top-4 left-4 z-10 bg-red-500 hover:bg-red-600 text-sm px-3 py-1">
                      Sale
                    </Badge>
                  )}
                  {product.image_urls[activeImage] ? (
                    <Image
                      src={product.image_urls[activeImage]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image Available
                    </div>
                  )}
                </div>
                
                {product.image_urls.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {product.image_urls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'}`}
                      >
                        <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">{product.brand || 'VogueMart'}</span>
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-current' : 'text-muted'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">(24 reviews)</span>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
                
                <div className="flex items-end gap-4 mb-6 pb-6 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-extrabold">${currentPrice.toFixed(2)}</span>
                    {isDiscounted && (
                      <span className="text-xl text-muted-foreground line-through mb-1">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="mb-2">
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </Badge>
                </div>

                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex items-center border rounded-full overflow-hidden bg-background h-14">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors h-full flex items-center justify-center hover:bg-muted"
                      disabled={product.stock === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity + 1))} // In real app, limit by stock
                      className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors h-full flex items-center justify-center hover:bg-muted"
                      disabled={product.stock === 0}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="flex-1 h-14 text-lg rounded-full gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </Button>
                  
                  <Button size="lg" variant="outline" className="h-14 w-14 rounded-full p-0 shrink-0">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>

                {/* Value Propositions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Free Shipping</p>
                      <p className="text-xs text-muted-foreground">On orders over $200</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">2 Year Warranty</p>
                      <p className="text-xs text-muted-foreground">Full coverage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs for extra details */}
            <div className="mt-16 pt-8 border-t">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
                  <TabsTrigger value="description" className="text-base">Description</TabsTrigger>
                  <TabsTrigger value="specifications" className="text-base">Specifications</TabsTrigger>
                  <TabsTrigger value="reviews" className="text-base">Reviews (24)</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
                  <h3>About this product</h3>
                  <p>{product.description}</p>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </TabsContent>
                <TabsContent value="specifications" className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
                  <h3>Technical Specifications</h3>
                  <ul>
                    <li><strong>Brand:</strong> {product.brand || 'N/A'}</li>
                    <li><strong>Category:</strong> {MOCK_CATEGORIES.find(c => c.id === product.category_id)?.name}</li>
                    <li><strong>Weight:</strong> 1.2 lbs</li>
                    <li><strong>Dimensions:</strong> 10 x 8 x 2 inches</li>
                  </ul>
                </TabsContent>
                <TabsContent value="reviews" className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
                  <h3>Customer Reviews</h3>
                  <p>Reviews will be displayed here...</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
