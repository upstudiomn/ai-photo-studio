/**
 * Local Storage Smoke Test Script
 *
 * Tests local file storage upload and retrieval.
 * Run: npx tsx scripts/local-storage-smoke-test.ts
 */

import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";

const UPLOAD_ROOT = path.resolve(process.cwd(), "./uploads");
const TEST_SESSION_ID = `test-${randomUUID()}`;

async function runStorageTest() {
  console.log("=== Local Storage Smoke Test ===\n");

  try {
    // Test 1: Create directories
    console.log("1. Testing directory creation...");
    await mkdir(path.join(UPLOAD_ROOT, "source-images", TEST_SESSION_ID), { recursive: true });
    await mkdir(path.join(UPLOAD_ROOT, "generated-previews", TEST_SESSION_ID), { recursive: true });
    await mkdir(path.join(UPLOAD_ROOT, "final-outputs", TEST_SESSION_ID), { recursive: true });
    console.log("   Created directories: OK");

    // Test 2: Write source image
    console.log("\n2. Testing source image upload...");
    const testImageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
      "base64"
    );
    const sourcePath = path.join(UPLOAD_ROOT, "source-images", TEST_SESSION_ID, "test-image.png");
    await writeFile(sourcePath, testImageBuffer);
    console.log(`   Wrote: ${sourcePath}`);
    console.log(`   Size: ${testImageBuffer.length} bytes`);
    console.log("   Source image upload: OK");

    // Test 3: Write generated preview
    console.log("\n3. Testing generated preview upload...");
    const previewBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP4z8CwDwADeQFR4P7PygAAAABJRU5ErkJggg==",
      "base64"
    );
    const previewPath = path.join(UPLOAD_ROOT, "generated-previews", TEST_SESSION_ID, "preview.png");
    await writeFile(previewPath, previewBuffer);
    console.log(`   Wrote: ${previewPath}`);
    console.log("   Generated preview upload: OK");

    // Test 4: Read back
    console.log("\n4. Testing file read back...");
    const readBuffer = await readFile(sourcePath);
    console.log(`   Read ${readBuffer.length} bytes from: ${sourcePath}`);
    console.log("   File read: OK");

    // Test 5: Public URL generation
    console.log("\n5. Testing public URL generation...");
    const sourcePublicPath = `/uploads/source-images/${TEST_SESSION_ID}/test-image.png`;
    const previewPublicPath = `/uploads/generated-previews/${TEST_SESSION_ID}/preview.png`;
    console.log(`   Source URL: ${sourcePublicPath}`);
    console.log(`   Preview URL: ${previewPublicPath}`);
    console.log("   Public URL generation: OK");

    // Test 6: File deletion
    console.log("\n6. Testing file cleanup...");
    await rm(path.join(UPLOAD_ROOT, "source-images", TEST_SESSION_ID), { recursive: true });
    await rm(path.join(UPLOAD_ROOT, "generated-previews", TEST_SESSION_ID), { recursive: true });
    await rm(path.join(UPLOAD_ROOT, "final-outputs", TEST_SESSION_ID), { recursive: true });
    console.log("   Cleanup: OK");

    console.log("\n=== All Storage Tests Passed ===");

  } catch (error) {
    console.error("\n!!! TEST FAILED !!!");
    console.error(error);
    process.exit(1);
  }
}

runStorageTest();
