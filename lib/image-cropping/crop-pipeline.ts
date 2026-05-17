import https from "node:https";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

import { uploadCroppedImageToTransloadit } from "@/lib/image-cropping/transloadit-upload";

const execAsync = promisify(exec);

export type CropJobPayload = {
  imageUrl: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
};

export type CropJobResult = {
  success: boolean;
  croppedImageUrl?: string | null;
  message: string;
  error?: string;
};

export const MIN_TASK_DURATION_MS = 30_000;

async function downloadImage(imageUrl: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith("https") ? https : http;

    protocol.get(imageUrl, (response) => {
      if (
        response.statusCode === 301 ||
        response.statusCode === 302 ||
        response.statusCode === 307
      ) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, filePath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(
          new Error(
            `Failed to download image: ${response.statusCode} ${response.statusMessage}`,
          ),
        );
        return;
      }

      const file = fs.createWriteStream(filePath);
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
      file.on("error", (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    });
  });
}

async function getImageDimensions(imagePath: string) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${imagePath}"`,
    );
    const [width, height] = stdout.trim().split("x").map(Number);
    if (width && height) {
      return { width, height };
    }
  } catch {
    // Fall through to format-level dimensions for still images.
  }

  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=width,height -of csv=s=x:p=0 "${imagePath}"`,
  );
  const [width, height] = stdout.trim().split("x").map(Number);
  if (!width || !height) {
    throw new Error("Could not determine image dimensions");
  }
  return { width, height };
}

async function cropImageWithFFmpeg(
  inputPath: string,
  outputPath: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const cropFilter = `crop=${width}:${height}:${x}:${y}`;
  try {
    await execAsync(
      `ffmpeg -i "${inputPath}" -vf "${cropFilter}" -y "${outputPath}"`,
    );
  } catch (error) {
    throw new Error(`FFmpeg cropping failed: ${error}`);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * x/y = start position (%). width/height = end position (%) on each axis.
 * Example: x=8, width=80 → crop from 8% to 80% horizontally (72% wide).
 */
function resolveCropPixels(
  imgWidth: number,
  imgHeight: number,
  xPercent: number,
  yPercent: number,
  widthPercent: number,
  heightPercent: number,
) {
  const xStart = Math.min(xPercent, widthPercent);
  const xEnd = Math.max(xPercent, widthPercent);
  const yStart = Math.min(yPercent, heightPercent);
  const yEnd = Math.max(yPercent, heightPercent);

  if (xEnd > 100 || yEnd > 100 || xStart < 0 || yStart < 0) {
    throw new Error("Invalid crop dimensions");
  }

  const pixelX = Math.round((xStart / 100) * imgWidth);
  const pixelY = Math.round((yStart / 100) * imgHeight);
  const pixelXEnd = Math.round((xEnd / 100) * imgWidth);
  const pixelYEnd = Math.round((yEnd / 100) * imgHeight);

  const pixelWidth = pixelXEnd - pixelX;
  const pixelHeight = pixelYEnd - pixelY;

  if (
    pixelWidth <= 0 ||
    pixelHeight <= 0 ||
    pixelX < 0 ||
    pixelY < 0 ||
    pixelXEnd > imgWidth ||
    pixelYEnd > imgHeight
  ) {
    throw new Error("Invalid crop dimensions");
  }

  return { pixelX, pixelY, pixelWidth, pixelHeight };
}

/** Shared FFmpeg + Transloadit crop pipeline (used by Trigger task and server fallback). */
export async function runCropImagePipeline(
  payload: CropJobPayload,
): Promise<CropJobResult> {
  const startedAt = Date.now();
  const tmpDir = path.join("/tmp", "workflow-crop");

  try {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const inputImagePath = path.join(tmpDir, `input-${Date.now()}.jpg`);
    const outputImagePath = path.join(tmpDir, `output-${Date.now()}.jpg`);

    await downloadImage(payload.imageUrl, inputImagePath);

    const { width: imgWidth, height: imgHeight } =
      await getImageDimensions(inputImagePath);

    const { pixelX, pixelY, pixelWidth, pixelHeight } = resolveCropPixels(
      imgWidth,
      imgHeight,
      payload.xPercent,
      payload.yPercent,
      payload.widthPercent,
      payload.heightPercent,
    );

    await cropImageWithFFmpeg(
      inputImagePath,
      outputImagePath,
      pixelX,
      pixelY,
      pixelWidth,
      pixelHeight,
    );

    const croppedImageUrl =
      await uploadCroppedImageToTransloadit(outputImagePath);

    fs.unlinkSync(inputImagePath);
    fs.unlinkSync(outputImagePath);

    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_TASK_DURATION_MS) {
      await sleep(MIN_TASK_DURATION_MS - elapsed);
    }

    return {
      success: true,
      croppedImageUrl,
      message: `Image cropped successfully. Dimensions: ${pixelWidth}x${pixelHeight}`,
    };
  } catch (error) {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors.
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_TASK_DURATION_MS) {
      await sleep(MIN_TASK_DURATION_MS - elapsed);
    }

    return {
      success: false,
      message: "Image cropping failed",
      error: String(error),
    };
  }
}
