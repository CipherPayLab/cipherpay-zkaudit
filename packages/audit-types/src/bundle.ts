export interface AuditBundleHeader {
  version: string;
  verifier_key_id?: string;
}

export interface AuditBundle {
  header: AuditBundleHeader;
  entries: unknown[];
}
