"use client";

import { useMemo, useState } from "react";

export function useSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function clear() {
    setSelectedIds([]);
  }

  function selectAll(ids: string[]) {
    setSelectedIds(ids);
  }

  const selectedItems = useMemo(
    () => items.filter((item) => selectedSet.has(item.id)),
    [items, selectedSet]
  );

  return {
    selectedIds,
    selectedItems,
    isSelected: (id: string) => selectedSet.has(id),
    toggle,
    clear,
    selectAll
  };
}
