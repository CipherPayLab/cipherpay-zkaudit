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
    "@cipherpay/proof-groth16",
  ],
};

export default nextConfig;
