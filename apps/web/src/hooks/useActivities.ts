"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActivityItem, ActivitiesApiResponse, ActivityKind } from "@/types/activity";

interface UseActivitiesOptions {
  kind?: ActivityKind | "all";
  search?: string;
}

export function useActivities(options: UseActivitiesOptions = {}) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setUnauthorized(false);

        const response = await fetch("/api/user/activities", {
          method: "GET",
          cache: "no-store",
          credentials: "include"
        });

        const data = (await response.json()) as
          | ActivitiesApiResponse
          | { ok: false; error?: string };

        if (response.status === 401) {
          if (!cancelled) {
            setUnauthorized(true);
            setItems([]);
          }
          return;
        }

        if (!response.ok) {
          throw new Error(data && "error" in data ? data.error ?? "Failed to fetch activities" : `Failed to fetch activities: ${response.status}`);
        }

        if (!cancelled && "items" in data) {
          setItems(data.items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const q = options.search?.trim().toLowerCase() ?? "";

    return items.filter((item) => {
      const kindMatch = !options.kind || options.kind === "all" || item.kind === options.kind;
      const searchMatch =
        q.length === 0 ||
        item.id.toLowerCase().includes(q) ||
        item.kind.toLowerCase().includes(q) ||
        item.amount.toLowerCase().includes(q) ||
        item.token_symbol.toLowerCase().includes(q) ||
        (item.counterparty?.toLowerCase().includes(q) ?? false) ||
        (item.tx_signature?.toLowerCase().includes(q) ?? false);

      return kindMatch && searchMatch;
    });
  }, [items, options.kind, options.search]);

  return {
    items: filteredItems,
    loading,
    error,
    unauthorized
  };
}
