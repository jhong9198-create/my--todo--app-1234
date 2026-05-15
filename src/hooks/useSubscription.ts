"use client";

import { useState, useEffect } from "react";

interface SubData {
  isActive: boolean;
  plan: string;
  activatedAt: string;
  expiresAt: string;
  code: string;
}

const STORAGE_KEY = "bhc_subscription";

const VALID_CODES = ["PREMIUM4900", "DEMO4900", "TEST"];

export function useSubscription() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState<SubData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: SubData = JSON.parse(raw);
        const valid = data.isActive && new Date(data.expiresAt) > new Date();
        setIsPremium(valid);
        setSubData(valid ? data : null);
        if (!valid) localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  function activate(code: string): boolean {
    const normalized = code.trim().toUpperCase().replace(/\s/g, "");
    const isValid = VALID_CODES.some(c => normalized.includes(c));
    if (!isValid) return false;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const data: SubData = {
      isActive: true,
      plan: "premium_monthly",
      activatedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      code: normalized,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setIsPremium(true);
    setSubData(data);
    return true;
  }

  function deactivate() {
    localStorage.removeItem(STORAGE_KEY);
    setIsPremium(false);
    setSubData(null);
  }

  function daysLeft(): number {
    if (!subData) return 0;
    const diff = new Date(subData.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return { isPremium, loading, subData, activate, deactivate, daysLeft };
}
