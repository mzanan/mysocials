"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function useCheckout() {
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    try {
      await authClient.checkout({ slug: "pro" });
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
    }
  }

  return { checkout, loading };
}
