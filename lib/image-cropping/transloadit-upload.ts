import crypto from "node:crypto";
import fs from "node:fs";

import { getImageUrlFromAssembly } from "@/lib/transloadit";

const CROP_UPLOAD_STEPS = {
  ":original": {
    robot: "/upload/handle",
  },
  exported: {
    robot: "/image/resize",
    use: ":original",
    width: 2400,
    height: 2400,
    resize_strategy: "fit",
    format: "jpg",
    result: true,
  },
} as const;

type TransloaditAssembly = {
  ok?: string;
  assembly_ssl_url?: string;
  error?: string;
  message?: string;
  results?: Record<
    string,
    Array<{ ssl_url?: string | null; url?: string | null }>
  >;
};

function signTransloaditParams(params: object) {
  const authKey = process.env.TRANSLOADIT_AUTH_KEY?.trim();
  const authSecret = process.env.TRANSLOADIT_AUTH_SECRET?.trim();

  if (!authKey || !authSecret) {
    throw new Error("Transloadit credentials are not configured");
  }

  const payload = {
    auth: {
      key: authKey,
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
    ...params,
  };

  const paramsString = JSON.stringify(payload);
  const signature = `sha384:${crypto
    .createHmac("sha384", authSecret)
    .update(paramsString, "utf8")
    .digest("hex")}`;

  return { paramsString, signature };
}

async function pollAssembly(assemblySslUrl: string): Promise<string> {
  const maxAttempts = 90;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(assemblySslUrl);
    if (!response.ok) {
      throw new Error(`Failed to poll Transloadit assembly: ${response.status}`);
    }

    const assembly = (await response.json()) as TransloaditAssembly;

    if (assembly.ok === "ASSEMBLY_COMPLETED") {
      const url = getImageUrlFromAssembly(assembly);
      if (!url) {
        throw new Error("Transloadit assembly completed without an image URL");
      }
      return url;
    }

    if (
      assembly.ok === "ASSEMBLY_CANCELED" ||
      assembly.ok === "ASSEMBLY_ABORTED"
    ) {
      throw new Error(
        assembly.error ??
          assembly.message ??
          `Transloadit assembly failed with status ${assembly.ok}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Timed out waiting for Transloadit assembly to complete");
}

export async function uploadCroppedImageToTransloadit(
  filePath: string,
): Promise<string> {
  const { paramsString, signature } = signTransloaditParams({
    steps: CROP_UPLOAD_STEPS,
  });

  const formData = new FormData();
  formData.append("params", paramsString);
  formData.append("signature", signature);
  formData.append(
    "file",
    new Blob([fs.readFileSync(filePath)], { type: "image/jpeg" }),
    "cropped.jpg",
  );

  const response = await fetch("https://api2.transloadit.com/assemblies", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Transloadit upload failed: ${response.status} ${response.statusText} ${body}`,
    );
  }

  const assembly = (await response.json()) as TransloaditAssembly;
  const assemblyUrl = assembly.assembly_ssl_url;
  if (!assemblyUrl) {
    throw new Error("Transloadit did not return an assembly URL");
  }

  if (assembly.ok === "ASSEMBLY_COMPLETED") {
    const url = getImageUrlFromAssembly(assembly);
    if (url) return url;
  }

  return pollAssembly(assemblyUrl);
}
