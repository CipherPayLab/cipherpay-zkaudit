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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/user/activities", {
          method: "GET",
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status}`);
        }

        const data = (await response.json()) as ActivitiesApiResponse;

        if (!cancelled) {
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
    error
  };
}
