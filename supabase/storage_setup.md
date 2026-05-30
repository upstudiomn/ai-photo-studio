# Supabase Storage Setup

AI Photo Studio uses Supabase Storage for customer source images, AI preview files, and final paid outputs.

## Buckets

### `source-images`

Purpose:
- Stores uploaded customer source/reference photos for a generation session.

Public/private:
- Recommended: private.

MVP notes:
- Keep customer originals private.
- Upload through server-side helpers or protected server actions.
- Store the bucket path in `uploaded_images.file_path`.
- Use signed URLs for admin/customer viewing later.

### `generated-previews`

Purpose:
- Stores watermarked AI preview images shown before final delivery.

Public/private:
- Recommended: private.
- Public previews can be considered later only if every preview is watermarked.

MVP notes:
- Private is safer for early launch.
- Store preview paths/URLs in `generated_outputs.preview_url` and `generated_outputs.watermarked_url`.
- Generated previews belong to `generation_sessions` before checkout creates a confirmed order.
- Use signed URLs when showing private previews.

### `final-outputs`

Purpose:
- Stores final full-resolution paid digital files and print-ready exports.

Public/private:
- Recommended: private.

MVP notes:
- Never expose final files publicly.
- Generate short-lived signed URLs after payment/admin approval.
- Keep final files separate from preview files so access rules stay clear.
- Final outputs should only become available after the selected preview is purchased through a confirmed order.

## Later Signed URL Flow

1. Upload file to a private bucket.
2. Store bucket path in the database.
3. When an authorized user needs access, create a signed URL server-side.
4. Use short expiry windows for final outputs.

## Manual Bucket Creation

Create these buckets in the Supabase dashboard:

```text
source-images
generated-previews
final-outputs
```

Set all three to private for the MVP.
