import type { ActivityItem } from "@/types/activity";

export interface UserExportRequest {
  disclosureLevel: "protocol_only";
  selectedIds: string[];
  selectedItems: ActivityItem[];
}

export function buildExportRequest(input: {
  selectedItems: ActivityItem[];
}): UserExportRequest {
  return {
    disclosureLevel: "protocol_only",
    selectedIds: input.selectedItems.map((item) => item.id),
    selectedItems: input.selectedItems
  };
}
