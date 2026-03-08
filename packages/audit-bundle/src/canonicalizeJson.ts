function sortRecursively(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortRecursively);
  }

  if (value !== null && typeof value === "object") {
    const sortedEntries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nestedValue]) => [key, sortRecursively(nestedValue)]);

    return Object.fromEntries(sortedEntries);
  }

  return value;
}

export function canonicalizeJson(value: unknown): string {
  return JSON.stringify(sortRecursively(value));
}
