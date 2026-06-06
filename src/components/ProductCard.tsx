'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product details
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const isDiscounted = product.discount_price && product.discount_price < product.price;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group h-full overflow-hidden flex flex-col transition-all hover:shadow-md border-transparent hover:border-border/50 bg-card">
        <div className="relative aspect-square overflow-hidden bg-muted/20">
          {isDiscounted && (
            <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-600">
              Sale
            </Badge>
          )}
          {product.image_urls[0] ? (
            <Image
              src={product.image_urls[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}
        </div>
        
        <CardContent className="flex-1 p-4 flex flex-col gap-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{product.brand || 'VogueMart'}</div>
          <h3 className="font-medium text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mt-auto pt-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < 4 ? 'fill-current' : 'text-muted'}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">(12)</span>
          </div>
          <div className="flex items-end gap-2 mt-1">
            {isDiscounted ? (
              <>
                <span className="text-lg font-bold">${product.discount_price?.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground line-through mb-0.5">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full gap-2 transition-all opacity-90 group-hover:opacity-100" 
            variant="default"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
