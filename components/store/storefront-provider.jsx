"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getDefaultProductSize } from "@/lib/product-utils";

const StorefrontContext = createContext(null);

export function StorefrontProvider({ children, demoMode = true, initialCart = [], initialWishlistIds = [] }) {
  const [cartItems, setCartItems] = useState(initialCart);
  const [wishlistIds, setWishlistIds] = useState(initialWishlistIds);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const syncCart = useCallback(async (response) => {
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "কার্ট হালনাগাদ করা যায়নি।");
    setCartItems(result.items || []);
    return result;
  }, []);

  const addToCart = useCallback(async (product, size = getDefaultProductSize(product), quantity = 1) => {
    const productId = product._id || product.id || product.slug;
    const selectedSize = typeof size === "string" ? product.sizes?.find((item) => item.label === size) : size;
    const defaultSize = getDefaultProductSize(product);
    const sizeLabel = selectedSize?.label || defaultSize?.label || (Array.isArray(product.sizes) && product.sizes.length ? "১ কেজি" : "স্ট্যান্ডার্ড");
    const price = Number(selectedSize?.price ?? product.price);
    const image = product.images?.[0] || "/images/collection-misti.svg";

    if (!demoMode) {
      try {
        const response = await fetch("/api/store/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add", productId, size: sizeLabel, quantity }),
        });
        await syncCart(response);
        setNotice(`${product.name} কার্টে যোগ হয়েছে।`);
      } catch (error) {
        setNotice(error.message || "কার্টে যোগ করা যায়নি।");
      }
      return;
    }

    setCartItems((items) => {
      const existing = items.find((item) => item.productId === productId && item.size === sizeLabel);
      if (existing) {
        return items.map((item) => item.productId === productId && item.size === sizeLabel
          ? { ...item, quantity: Math.min(item.quantity + quantity, 10) }
          : item);
      }
      return [...items, { productId, slug: product.slug, name: product.name, image, size: sizeLabel, price, quantity: Math.min(Math.max(quantity, 1), 10) }];
    });
    setNotice(`${product.name} ডেমো কার্টে যোগ হয়েছে।`);
  }, [demoMode, syncCart]);

  const updateQuantity = useCallback(async (productId, size, quantity) => {
    const safeQuantity = Math.min(Math.max(Number(quantity) || 1, 1), 10);
    if (!demoMode) {
      try {
        const response = await fetch("/api/store/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, size, quantity: safeQuantity }),
        });
        await syncCart(response);
      } catch (error) {
        setNotice(error.message || "পরিমাণ পরিবর্তন করা যায়নি।");
      }
      return;
    }
    setCartItems((items) => items.map((item) => item.productId === productId && item.size === size ? { ...item, quantity: safeQuantity } : item));
  }, [demoMode, syncCart]);

  const removeFromCart = useCallback(async (productId, size) => {
    if (!demoMode) {
      try {
        const response = await fetch("/api/store/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, size }),
        });
        await syncCart(response);
      } catch (error) {
        setNotice(error.message || "পণ্যটি সরানো যায়নি।");
      }
      return;
    }
    setCartItems((items) => items.filter((item) => !(item.productId === productId && item.size === size)));
    setNotice("পণ্যটি কার্ট থেকে সরানো হয়েছে।");
  }, [demoMode, syncCart]);

  const clearCart = useCallback(async () => {
    if (!demoMode) {
      try {
        const response = await fetch("/api/store/cart", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clear: true }) });
        await syncCart(response);
      } catch (error) {
        setNotice(error.message || "কার্ট খালি করা যায়নি।");
      }
      return;
    }
    setCartItems([]);
  }, [demoMode, syncCart]);

  const toggleWishlist = useCallback(async (productId) => {
    const exists = wishlistIds.includes(productId);
    if (!demoMode) {
      try {
        const response = await fetch("/api/store/wishlist", {
          method: exists ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "ইচ্ছেতালিকা হালনাগাদ করা যায়নি।");
        setWishlistIds(result.productIds || []);
        setNotice(exists ? "ইচ্ছেতালিকা থেকে সরানো হয়েছে।" : "ইচ্ছেতালিকায় যোগ হয়েছে।");
      } catch (error) {
        setNotice(error.message || "ইচ্ছেতালিকা হালনাগাদ করা যায়নি।");
      }
      return;
    }
    setWishlistIds((items) => exists ? items.filter((item) => item !== productId) : [...items, productId]);
    setNotice(exists ? "ইচ্ছেতালিকা থেকে সরানো হয়েছে।" : "ইচ্ছেতালিকায় যোগ হয়েছে।");
  }, [demoMode, wishlistIds]);

  const value = useMemo(() => ({
    demoMode,
    cartItems,
    cartCount: cartItems.reduce((total, item) => total + item.quantity, 0),
    cartSubtotal: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    wishlistIds,
    notice,
    setNotice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
  }), [demoMode, cartItems, wishlistIds, notice, addToCart, updateQuantity, removeFromCart, clearCart, toggleWishlist]);

  return (
    <StorefrontContext.Provider value={value}>
      {children}
      {notice ? <div className="store-notice" role="status" aria-live="polite"><span>{notice}</span></div> : null}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) throw new Error("useStorefront must be used inside StorefrontProvider");
  return context;
}
