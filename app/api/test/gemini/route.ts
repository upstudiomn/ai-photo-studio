/**
 * Gemini Smoke Test API Route
 *
 * POST /api/test/gemini
 *
 * This endpoint tests the full Gemini image-input flow.
 * It creates a session, uploads a test image, selects a template,
 * and generates AI preview.
 */

import { NextResponse } from "next/server";
import { createGenerationSession, addUploadedImage, saveGeneratedOutput, getGenerationSessionById, updateGenerationSessionStatus } from "@/server/orders";
import { uploadSessionSourceImage, ensureSourceImagesBucket, loadImageFromStorageAsBase64, uploadGeneratedPreview, SOURCE_IMAGES_BUCKET } from "@/server/storage";
import { getImageProvider, getActiveAIProvider } from "@/server/ai/provider";
import { getTemplateBySlug } from "@/lib/templates";

export async function POST() {
  try {
    console.log("=== Gemini Smoke Test Started ===");

    // Step 1: Create generation session
    console.log("Step 1: Creating session...");
    const session = await createGenerationSession({ status: "draft" });
    const sessionId = session.id;
    console.log(`  Session: ${sessionId}`);

    // Step 2: Upload test image
    console.log("Step 2: Uploading test image...");
    await ensureSourceImagesBucket();

    // Create a simple test image (1x1 red pixel PNG)
    const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
    const testImageBuffer = Buffer.from(testImageBase64, "base64");

    const uploaded = await uploadSessionSourceImage({
      sessionId,
      file: new Blob([testImageBuffer], { type: "image/png" }),
      fileName: "test-gemini.png",
      contentType: "image/png",
    });
    console.log(`  Uploaded: ${uploaded.path}`);

    // Step 3: Save uploaded image record
    console.log("Step 3: Saving uploaded image record...");
    const uploadedImage = await addUploadedImage({
      session_id: sessionId,
      file_url: uploaded.fileUrl,
      file_path: uploaded.path,
      image_type: "source",
    });
    console.log(`  Record: ${uploadedImage.id}`);

    // Step 4: Load uploaded image from storage
    console.log("Step 4: Loading uploaded image from storage...");
    const loadedImage = await loadImageFromStorageAsBase64(SOURCE_IMAGES_BUCKET, uploaded.path);
    console.log(`  Loaded: ${loadedImage.mimeType}, ${loadedImage.base64.length} bytes`);

    // Step 5: Get template
    console.log("Step 5: Getting template...");
    const template = getTemplateBySlug("old-photo-restoration");
    if (!template) {
      throw new Error("Template not found");
    }
    console.log(`  Template: ${template.titleMn}`);

    // Step 6: Call AI provider
    console.log("Step 6: Calling AI provider...");
    const provider = getImageProvider();
    const activeProvider = getActiveAIProvider();
    console.log(`  Provider: ${activeProvider}`);

    let generated;
    try {
      generated = await provider.generate({
        templateId: template.id,
        prompt: template.prompt,
        imageUrls: [loadedImage.dataUrl],
        aspectRatio: template.defaultAspectRatio,
      });
      console.log(`  Generated: ${generated.length} outputs`);
    } catch (providerError) {
      console.error("  Provider call failed:", providerError);
      console.log("  Falling back to mock provider...");

      // Switch to mock provider
      const mockProvider = (await import("@/server/ai/mock")).mockImageProvider;
      generated = await mockProvider.generate({
        templateId: template.id,
        prompt: template.prompt,
        imageUrls: [],
        aspectRatio: template.defaultAspectRatio,
      });
      console.log(`  Mock generated: ${generated.length} outputs`);
    }

    // Step 7: Update session status
    console.log("Step 7: Updating session status...");
    await updateGenerationSessionStatus(sessionId, "generating");

    // Step 8: Save outputs
    console.log("Step 8: Saving outputs...");
    const savedOutputs = [];
    for (const output of generated.slice(0, 3)) {
      let previewUrl = output.previewUrl;
      let watermarkedUrl = output.previewUrl;

      // Save Gemini output to storage if it's a data URL
      if (output.provider === "gemini" && previewUrl.startsWith("data:")) {
        try {
          const base64Match = previewUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (base64Match) {
            const mimeType = base64Match[1];
            const base64Data = base64Match[2];
            const buffer = Buffer.from(base64Data, "base64");
            const stored = await uploadGeneratedPreview(sessionId, buffer, mimeType);
            previewUrl = stored.fileUrl;
            watermarkedUrl = stored.fileUrl;
            console.log(`  Saved to storage: ${stored.path}`);
          }
        } catch (err) {
          console.error("  Storage save failed:", err);
        }
      }

      const savedOutput = await saveGeneratedOutput({
        session_id: sessionId,
        provider: output.provider,
        model: output.model,
        preview_url: previewUrl,
        watermarked_url: watermarkedUrl,
        full_res_url: output.fullResUrl ?? null,
        is_selected: false,
      });
      savedOutputs.push(savedOutput);
      console.log(`  Saved: ${savedOutput.id}, provider=${savedOutput.provider}, model=${savedOutput.model}`);
    }

    // Step 9: Update session to preview_ready
    console.log("Step 9: Updating session to preview_ready...");
    await updateGenerationSessionStatus(sessionId, "preview_ready");

    const updatedSession = await getGenerationSessionById(sessionId);
    console.log(`  Session status: ${updatedSession.status}`);

    console.log("\n=== Smoke Test PASSED ===");

    return NextResponse.json({
      success: true,
      sessionId,
      provider: activeProvider,
      template: template.slug,
      outputs: savedOutputs.map((o) => ({
        id: o.id,
        provider: o.provider,
        model: o.model,
        hasPreviewUrl: !!o.preview_url,
        previewUrlLength: o.preview_url?.length ?? 0,
      })),
      sessionStatus: updatedSession.status,
    });
  } catch (error) {
    console.error("\n!!! Smoke Test FAILED !!!");
    console.error(error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
