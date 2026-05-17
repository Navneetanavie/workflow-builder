import { defineConfig } from "@trigger.dev/sdk/v3";

const projectRef = process.env.TRIGGER_PROJECT_REF;

export default defineConfig({
  project: projectRef!,
  dirs: ["./lib/image-cropping", "./lib/gemini"],
  retries: {
    enabledInDev: false,
  },
  maxDuration: 300,
});
