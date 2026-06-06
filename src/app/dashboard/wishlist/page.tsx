'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getWishlist, removeFromWishlist } from '@/services/wishlist';
import { getProducts } from '@/services/products';
import { Wishlist, Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, ShoppingCart, Loader2, PackageOpen } from 'lucide-react';
import { toast } from 'sonner';

type WishlistItem = Wishlist & { product?: Product };

export default function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [wishlistEntries, products] = await Promise.all([
          getWishlist(user.id),
          getProducts(),
        ]);
        const merged = wishlistEntries.map((w) => ({
          ...w,
          product: products.find((p) => p.id === w.product_id),
        }));
        setItems(merged);
      } catch {
        toast.error('Failed to load wishlist');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const handleRemove = async (wishlistId: string) => {
    try {
      await removeFromWishlist(wishlistId);
      setItems((prev) => prev.filter((i) => i.id !== wishlistId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your wishlist…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
          <p className="text-muted-foreground mt-1">
            {items.length} saved item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="outline">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add All to Cart
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 border rounded-2xl bg-card">
          <PackageOpen className="w-16 h-16 text-muted-foreground/30" />
          <p className="text-muted-foreground text-lg font-medium">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground">Browse products and add them to your wishlist</p>
          <Button asChild variant="outline">
            <a href="/products">Browse Products</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden group relative">
              {/* Product image */}
              <div className="h-48 bg-muted/30 flex items-center justify-center overflow-hidden">
                {item.product?.image_urls?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.image_urls[0]}
                    alt={item.product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Heart className="w-12 h-12 text-muted-foreground/30" />
                )}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <CardContent className="pt-5">
                <h3 className="font-semibold line-clamp-1">
                  {item.product?.name ?? 'Product unavailable'}
                </h3>
                {item.product && (
                  <p className="font-bold mt-1 text-lg text-primary">
                    ${item.product.discount_price?.toFixed(2) ?? item.product.price.toFixed(2)}
                    {item.product.discount_price && (
                      <span className="ml-2 text-sm line-through text-muted-foreground font-normal">
                        ${item.product.price.toFixed(2)}
                      </span>
                    )}
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1"
                    disabled={!item.product || item.product.stock === 0}
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {!item.product || item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
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
