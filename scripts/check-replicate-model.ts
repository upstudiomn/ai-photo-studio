/**
 * Replicate Model Validation Script
 *
 * Safe script to validate the configured REPLICATE_IMAGE_MODEL
 * WITHOUT running any predictions or spending credits.
 *
 * This script:
 * 1. Reads REPLICATE_IMAGE_MODEL from .env.local
 * 2. Validates against known blocklists
 * 3. Checks if it's a known candidate model
 * 4. Optionally fetches model version schema from Replicate API
 *    (metadata only, no predictions)
 *
 * Run: npx tsx scripts/check-replicate-model.ts
 *
 * IMPORTANT: This script does NOT run predictions.
 * It only checks model configuration and schema metadata.
 */

import "dotenv/config";

// Load environment variables from .env.local if available
import * as fs from "node:fs";
import * as path from "node:path";

const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join("=");
      }
    }
  }
}

import {
  validateReplicateImageEditModel,
  CANDIDATE_IMAGE_EDIT_MODELS,
} from "../lib/replicate-model-validation";

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN ?? "";
const CURRENT_MODEL = process.env.REPLICATE_IMAGE_MODEL ?? "";

async function fetchModelSchema(modelSlug: string, token: string): Promise<{
  ok: boolean;
  schema?: unknown;
  error?: string;
}> {
  if (!token) {
    return { ok: false, error: "REPLICATE_API_TOKEN not set" };
  }

  try {
    // Get model versions (metadata only, no prediction)
    // This does NOT spend credits
    const url = `https://api.replicate.com/v1/models/${modelSlug}/versions`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { ok: false, error: "Unauthorized - invalid or expired API token" };
      }
      if (response.status === 404) {
        return { ok: false, error: `Model not found: ${modelSlug}` };
      }
      return { ok: false, error: `API error: ${response.status} ${response.statusText}` };
    }

    const data = await response.json() as {
      results?: Array<{
        id: string;
        created_at: string;
        openapi_schema?: {
          components?: {
            schemas?: {
              Input?: {
                properties?: Record<string, unknown>;
              };
            };
          };
        };
      }>;
    };

    // Extract input fields from the latest version
    if (data.results && data.results.length > 0) {
      const latestVersion = data.results[0];
      const schema = latestVersion?.openapi_schema?.components?.schemas?.Input?.properties;
      return { ok: true, schema: schema ?? {} };
    }

    return { ok: true, schema: {} };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, error: message };
  }
}

function findImageInputFields(schema: Record<string, unknown>): string[] {
  const knownImageFields = [
    "image",
    "input_image",
    "init_image",
    "source_image",
    "image_url",
    "input_image_url",
    "mask_image",
    "source",
    "img",
    "photo",
  ];

  const foundFields: string[] = [];

  for (const fieldName of Object.keys(schema)) {
    const lowerName = fieldName.toLowerCase();
    for (const knownField of knownImageFields) {
      if (lowerName.includes(knownField)) {
        foundFields.push(fieldName);
        break;
      }
    }
  }

  return foundFields;
}

async function runValidation() {
  console.log("=".repeat(60));
  console.log("  Replicate Model Validation Script");
  console.log("  (Safe - does NOT run predictions or spend credits)");
  console.log("=".repeat(60));
  console.log("");

  // Step 1: Check environment
  console.log("Step 1: Environment Check");
  console.log("-".repeat(40));
  console.log(`  REPLICATE_API_TOKEN: ${REPLICATE_TOKEN ? "SET" : "NOT SET"}`);
  console.log(`  REPLICATE_IMAGE_MODEL: ${CURRENT_MODEL || "(empty)"}`);
  console.log("");

  // Step 2: Validate model against blocklist
  console.log("Step 2: Blocklist Validation");
  console.log("-".repeat(40));
  const blocklistResult = validateReplicateImageEditModel(CURRENT_MODEL);

  if (blocklistResult.isBlocked) {
    console.log("  Status: BLOCKED");
    console.log(`  Reason: ${blocklistResult.reason}`);
  } else if (blocklistResult.ok) {
    console.log("  Status: VALID");
    console.log(`  Reason: ${blocklistResult.reason}`);
  } else {
    console.log("  Status: UNKNOWN - Manual verification required");
    console.log(`  Reason: ${blocklistResult.reason}`);
  }
  console.log("");

  // Step 3: Check if it's a known candidate
  console.log("Step 3: Candidate Model Check");
  console.log("-".repeat(40));
  const candidate = CANDIDATE_IMAGE_EDIT_MODELS.find((m) => m.slug === CURRENT_MODEL);

  if (candidate) {
    console.log(`  Found in candidate list: YES`);
    console.log(`  Name: ${candidate.name}`);
    console.log(`  Description: ${candidate.description}`);
    console.log(`  Category: ${candidate.category}`);
    console.log(`  Expected image fields: ${candidate.expectedImageFields.join(", ")}`);
  } else {
    console.log(`  Found in candidate list: NO`);
    console.log(`  Model is not a verified candidate.`);
    console.log("");
    console.log(`  Known candidates:`);
    for (const m of CANDIDATE_IMAGE_EDIT_MODELS.slice(0, 5)) {
      console.log(`    - ${m.slug} (${m.category})`);
    }
    if (CANDIDATE_IMAGE_EDIT_MODELS.length > 5) {
      console.log(`    ... and ${CANDIDATE_IMAGE_EDIT_MODELS.length - 5} more`);
    }
  }
  console.log("");

  // Step 4: Fetch schema from Replicate API (metadata only)
  console.log("Step 4: Replicate API Schema Check");
  console.log("-".repeat(40));

  if (!CURRENT_MODEL) {
    console.log("  Skipped: No model configured");
  } else if (!REPLICATE_TOKEN) {
    console.log("  Skipped: No API token configured");
  } else {
    console.log(`  Fetching schema for: ${CURRENT_MODEL}`);
    console.log("  (Metadata only - no predictions, no credits spent)");

    const schemaResult = await fetchModelSchema(CURRENT_MODEL, REPLICATE_TOKEN);

    if (!schemaResult.ok) {
      console.log(`  Error: ${schemaResult.error}`);
    } else {
      const inputFields = findImageInputFields(schemaResult.schema as Record<string, unknown>);

      if (inputFields.length > 0) {
        console.log(`  Image input fields detected:`);
        for (const field of inputFields) {
          console.log(`    - ${field}`);
        }
        console.log("");
        console.log(`  Verdict: Model SUPPORTS image input`);
      } else {
        console.log(`  Image input fields: NONE DETECTED`);
        console.log("");
        console.log(`  Available input fields:`);
        const schema = schemaResult.schema as Record<string, unknown>;
        const fields = Object.keys(schema).slice(0, 10);
        for (const field of fields) {
          console.log(`    - ${field}`);
        }
        if (Object.keys(schema).length > 10) {
          console.log(`    ... and ${Object.keys(schema).length - 10} more`);
        }
        console.log("");
        console.log(`  Verdict: Model may NOT support image input`);
        console.log(`  Manual check recommended at: https://replicate.com/${CURRENT_MODEL}/versions`);
      }
    }
  }
  console.log("");

  // Step 5: Summary and recommendation
  console.log("=".repeat(60));
  console.log("  Summary & Recommendation");
  console.log("=".repeat(60));
  console.log("");

  if (blocklistResult.isBlocked) {
    console.log("  STATUS: CANNOT RUN");
    console.log("");
    console.log("  The configured model is on the blocklist and CANNOT be used");
    console.log("  for uploaded photo editing.");
    console.log("");
    console.log("  ACTION REQUIRED:");
    console.log(`    1. Change REPLICATE_IMAGE_MODEL in .env.local`);
    console.log("    2. Set it to an image-to-image model, e.g.:");
    console.log("       stability-ai/stable-diffusion-img2img");
    console.log("    3. Run this script again to validate");
    console.log("    4. Then test the full flow with /create");
  } else if (blocklistResult.ok) {
    console.log("  STATUS: READY TO TEST");
    console.log("");
    console.log("  The configured model is a verified image editing candidate.");
    console.log("");
    console.log("  NEXT STEPS:");
    console.log("    1. Verify Replicate account has credits");
    console.log("    2. Go to /create and upload an image");
    console.log("    3. Select a safe template (old photo restoration)");
    console.log("    4. Check /generate/[sessionId]");
    console.log("    5. Verify /results/[sessionId] shows real AI output");
  } else {
    console.log("  STATUS: MANUAL VERIFICATION REQUIRED");
    console.log("");
    console.log("  The model is not on the blocklist but is not a verified candidate.");
    console.log("");
    console.log("  ACTION REQUIRED:");
    console.log(`    1. Visit https://replicate.com/${CURRENT_MODEL || "<model>"}/versions`);
    console.log("    2. Check if the model has an 'image', 'input_image', or similar parameter");
    console.log("    3. If it only has prompt/width/height, it is text-to-image only");
    console.log("    4. If it has an image parameter, update the model or add to candidates");
  }

  console.log("");
  console.log("=".repeat(60));
  console.log("Script complete. No credits were spent.");
  console.log("=".repeat(60));
}

runValidation().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
