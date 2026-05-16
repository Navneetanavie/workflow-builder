import crypto from "node:crypto";

export const THUMBNAIL_ASSEMBLY_STEPS = {
  ":original": {
    robot: "/upload/handle",
  },
  exported: {
    robot: "/image/resize",
    use: ":original",
    width: 1200,
    height: 900,
    resize_strategy: "fit",
    format: "jpg",
    result: true,
  },
} as const;

type AssemblyParams = {
  auth: {
    key: string;
    expires: string;
    nonce: string;
  };
  steps: typeof THUMBNAIL_ASSEMBLY_STEPS;
};

export function createTransloaditSignature() {
  const authKey = process.env.TRANSLOADIT_AUTH_KEY?.trim();
  const authSecret = process.env.TRANSLOADIT_AUTH_SECRET?.trim();

  if (!authKey || !authSecret) {
    throw new Error("Transloadit credentials are not configured");
  }

  const params: AssemblyParams = {
    auth: {
      key: authKey,
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      nonce: crypto.randomUUID(),
    },
    steps: THUMBNAIL_ASSEMBLY_STEPS,
  };

  // Must sign the exact JSON string sent to Transloadit (Uppy appends this verbatim).
  const paramsString = JSON.stringify(params);
  const digest = crypto
    .createHmac("sha384", authSecret)
    .update(paramsString, "utf8")
    .digest("hex");

  return {
    params: paramsString,
    signature: `sha384:${digest}`,
  };
}

export function getImageUrlFromAssembly(assembly: {
  results?: Record<
    string,
    Array<{ ssl_url?: string | null; url?: string | null }>
  >;
}) {
  const results = assembly.results;
  if (!results) return null;

  const files =
    results.exported ?? results[":original"] ?? Object.values(results).flat();

  const file = files[0];
  return file?.ssl_url ?? file?.url ?? null;
}
