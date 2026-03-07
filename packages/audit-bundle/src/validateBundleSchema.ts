export function validateBundleSchema(bundle: unknown) {
  if (!bundle || typeof bundle !== "object") {
    throw new Error("Invalid bundle object");
  }

  return bundle;
}
