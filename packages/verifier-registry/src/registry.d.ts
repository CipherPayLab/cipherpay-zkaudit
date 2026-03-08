import type { VerifierDefinition } from "./types";
export declare const verifierRegistry: Record<string, VerifierDefinition>;
export declare function getVerifierDefinition(verifierKeyId: string): VerifierDefinition | null;
