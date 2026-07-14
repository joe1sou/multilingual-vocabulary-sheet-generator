"use client";

import { useEffect } from "react";
import { startPrototypeSession } from "@/lib/product-analytics";

export function PrototypeSession() {
  useEffect(() => startPrototypeSession(), []);
  return null;
}
