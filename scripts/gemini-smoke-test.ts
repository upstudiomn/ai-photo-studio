/**
 * Gemini Image Input Smoke Test
 *
 * This script tests the full Gemini image-input flow:
 * 1. Create a generation session
 * 2. Upload an image
 * 3. Select a template
 * 4. Generate AI preview with Gemini
 * 5. Verify output is saved
 *
 * Run: npx tsx scripts/gemini-smoke-test.ts
 */

import { createGenerationSession, addUploadedImage, getGenerationSessionById, listSessionGeneratedOutputs, saveGeneratedOutput } from "../server/orders";
import { uploadSessionSourceImage, ensureSourceImagesBucket, loadImageFromStorageAsBase64, SOURCE_IMAGES_BUCKET } from "../server/storage";
import { getImageProvider, getActiveAIProvider } from "../server/ai/provider";
import { getTemplateBySlug } from "../lib/templates";

async function runSmokeTest() {
  console.log("=== Gemini Image Input Smoke Test ===\n");

  let sessionId: string | null = null;
  let testPassed = true;

  try {
    // Step 1: Create generation session
    console.log("Step 1: Creating generation session...");
    const session = await createGenerationSession({ status: "draft" });
    sessionId = session.id;
    console.log(`  Session created: ${sessionId}`);
    console.log(`  Status: ${session.status}`);

    // Step 2: Ensure bucket exists and upload a test image
    console.log("\nStep 2: Uploading test image...");
    await ensureSourceImagesBucket();

    // Create a simple test image (1x1 red pixel PNG)
    const testImageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
      "base64"
    );

    const uploaded = await uploadSessionSourceImage({
      sessionId: sessionId!,
      file: new Blob([testImageBuffer], { type: "image/png" }),
      fileName: "test-image.png",
      contentType: "image/png",
    });

    console.log(`  Image uploaded to: ${uploaded.path}`);

    // Step 3: Save uploaded image record
    console.log("\nStep 3: Saving uploaded image record...");
    const uploadedImage = await addUploadedImage({
      session_id: sessionId!,
      file_url: uploaded.fileUrl,
      file_path: uploaded.path,
      image_type: "source",
    });
    console.log(`  Uploaded image record created: ${uploadedImage.id}`);

    // Step 4: Load uploaded image from storage
    console.log("\nStep 4: Loading uploaded image from storage...");
    const loadedImage = await loadImageFromStorageAsBase64(SOURCE_IMAGES_BUCKET, uploaded.path);
    console.log(`  Image loaded: ${loadedImage.mimeType}, ${loadedImage.base64.length} bytes`);

    // Step 5: Select template
    console.log("\nStep 5: Selecting template...");
    const template = getTemplateBySlug("old-photo-restoration");
    if (!template) {
      throw new Error("Template not found");
    }
    console.log(`  Template: ${template.titleMn} (${template.slug})`);
    console.log(`  Prompt: ${template.prompt.substring(0, 100)}...`);

    // Step 6: Call Gemini provider with image
    console.log("\nStep 6: Calling AI provider...");
    const provider = getImageProvider();
    const activeProvider = getActiveAIProvider();
    console.log(`  Active provider: ${activeProvider}`);

    const generated = await provider.generate({
      templateId: template.id,
      prompt: template.prompt,
      imageUrls: [loadedImage.dataUrl],
      aspectRatio: template.defaultAspectRatio,
    });

    console.log(`  Generated ${generated.length} outputs`);
    for (const output of generated) {
      console.log(`    - Provider: ${output.provider}, Model: ${output.model}`);
      console.log(`    - Preview URL: ${output.previewUrl.substring(0, 50)}...`);
    }

    // Step 7: Save outputs to database
    console.log("\nStep 7: Saving outputs to database...");
    for (const output of generated.slice(0, 3)) {
      const savedOutput = await saveGeneratedOutput({
        session_id: sessionId!,
        provider: output.provider,
        model: output.model,
        preview_url: output.previewUrl,
        watermarked_url: output.previewUrl,
        full_res_url: output.fullResUrl ?? null,
        is_selected: false,
      });
      console.log(`  Output saved: ${savedOutput.id}, provider: ${savedOutput.provider}`);
    }

    // Step 8: Verify session status
    console.log("\nStep 8: Verifying session...");
    const updatedSession = await getGenerationSessionById(sessionId!);
    console.log(`  Session status: ${updatedSession.status}`);

    // Step 9: List generated outputs
    console.log("\nStep 9: Listing generated outputs...");
    const outputs = await listSessionGeneratedOutputs(sessionId!);
    console.log(`  Found ${outputs.length} generated outputs`);
    for (const output of outputs) {
      console.log(`    - ID: ${output.id}`);
      console.log(`      Provider: ${output.provider}`);
      console.log(`      Model: ${output.model}`);
      console.log(`      Preview URL: ${output.preview_url?.substring(0, 50)}...`);
    }

    // Summary
    console.log("\n=== Test Results ===");
    console.log(`Session created: ${sessionId}`);
    console.log(`Uploaded image loaded: YES`);
    console.log(`AI provider called: ${activeProvider}`);
    console.log(`Generated outputs: ${generated.length}`);
    console.log(`Outputs saved to DB: ${outputs.length}`);
    console.log(`Session status: ${updatedSession.status}`);
    console.log(`\nOverall: ${testPassed ? "PASSED" : "FAILED"}`);

  } catch (error) {
    console.error("\n!!! TEST FAILED !!!");
    console.error(error);

    if (sessionId) {
      console.log(`\nSession ID for debugging: ${sessionId}`);
    }

    testPassed = false;
  }

  process.exit(testPassed ? 0 : 1);
}

runSmokeTest();
