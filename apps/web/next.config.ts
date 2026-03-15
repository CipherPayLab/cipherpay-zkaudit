import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(process.cwd(), "..", ".."),
  transpilePackages: [
    "@cipherpay/audit-types",
    "@cipherpay/verifier-registry",
    "@cipherpay/audit-bundle",
    "@cipherpay/audit-export",
    "@cipherpay/audit-engine",
    "@cipherpay/chain-solana",
  ],
  // snarkjs + ffjavascript use WebAssembly and worker_threads — they must NOT be
  // bundled by webpack or groth16.verify will hang indefinitely.
  // @cipherpay/proof-groth16 is kept as an external too so it always loads from
  // its pre-built dist/ (avoiding stale webpack cache of the verifier-registry
  // signal-order definitions).
  serverExternalPackages: [
    "snarkjs",
    "ffjavascript",
    "@cipherpay/proof-groth16",
  ],
};

export default nextConfig;
