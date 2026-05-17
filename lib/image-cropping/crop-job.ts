import { task, logger } from "@trigger.dev/sdk/v3";

import { runCropImagePipeline } from "@/lib/image-cropping/crop-pipeline";

export type { CropJobPayload, CropJobResult } from "@/lib/image-cropping/crop-pipeline";
import type { CropJobPayload, CropJobResult } from "@/lib/image-cropping/crop-pipeline";

export const cropImageJob = task({
  id: "crop-image",
  run: async (payload: CropJobPayload): Promise<CropJobResult> => {
    logger.info("Starting crop-image task", { url: payload.imageUrl });
    return runCropImagePipeline(payload);
  },
});
