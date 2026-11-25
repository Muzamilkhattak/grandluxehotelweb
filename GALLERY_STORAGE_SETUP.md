# Gallery Storage Setup - Supabase Migration

## Problem Fixed

The application was experiencing `EROFS: read-only file system` errors on the live website when attempting to delete gallery images. This occurred because:

1. **Serverless Environment Limitation**: In production deployments (Vercel, AWS Lambda, etc.), the filesystem is read-only except for `/tmp`
2. **Local Storage Approach**: The original code used Node.js `fs` module to store files in `public/uploads/gallery/`
3. **Non-Persistent Storage**: Even if files were written to `/tmp`, they wouldn't persist across deployments or serverless function invocations

## Solution Implemented

Migrated from local filesystem storage to **Supabase Storage**, which provides:

- ✅ **Cloud-based storage** that works in any environment
- ✅ **Persistent storage** across deployments
- ✅ **Automatic CDN delivery** for fast image loading
- ✅ **Built-in access control** and security
- ✅ **No filesystem dependencies**

## Setup Instructions

### 1. Environment Variables

Ensure your environment has these Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` is required for admin operations (creating buckets, uploading, deleting). Get it from:
- Supabase Dashboard → Project Settings → API → `service_role` key

⚠️ **Never expose the service role key in client-side code or commit it to version control.**

### 2. Supabase Storage Bucket

The bucket will be created automatically on first upload with these settings:

- **Bucket Name**: `gallery-images`
- **Public Access**: Enabled (images are publicly accessible via URL)
- **File Size Limit**: 10MB
- **Allowed Types**: JPEG, PNG, WebP, GIF, AVIF

#### Manual Bucket Creation (Optional)

If you prefer to create it manually:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `gallery-images`
3. Enable "Public bucket" option
4. Set file size limit to 10MB
5. Configure allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/avif`

### 3. Storage Policies (Optional)

For additional security, you can add Row Level Security policies:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery-images');

-- Allow authenticated admin users to upload
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery-images');

-- Allow authenticated admin users to delete
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery-images');
```

However, since we're using the service role key (which bypasses RLS), these policies are optional.

## Code Changes Summary

### Files Modified:

1. **`src/app/actions/admin-gallery.ts`**
   - Removed `fs/promises` and local file system operations
   - Added Supabase Storage integration
   - Implemented `ensureBucketExists()` for automatic bucket creation
   - Updated upload, delete, and list operations to use Supabase Storage API

2. **`src/utils/supabase/server.ts`**
   - Added `createSupabaseServerAdmin()` function
   - Uses service role key for admin operations

3. **`src/components/admin/AdminGalleryClient.tsx`**
   - Updated to handle Supabase public URLs instead of local paths
   - Removed conditional `unoptimized` prop (now always true for external URLs)

4. **`next.config.ts`**
   - Already had Supabase domain configured for Next.js Image optimization

## Testing

After deployment, test the following:

1. **Upload**: Upload a new image via admin gallery
2. **Display**: Verify image appears in gallery with correct URL
3. **Delete**: Delete an image (should work without EROFS error)
4. **Persistence**: Redeploy and verify images remain accessible

## Migration Guide (Existing Images)

If you have existing images in `public/uploads/gallery/` that need to be migrated:

1. Download all images from production
2. Upload them manually through the admin interface, or
3. Use Supabase CLI or API to bulk upload:

```bash
# Using Supabase CLI
supabase storage cp public/uploads/gallery/* supabase://gallery-images/
```

## Rollback Plan

If you need to rollback to local storage:

1. Restore `src/app/actions/admin-gallery.ts` from git history
2. Keep the `createSupabaseServerAdmin` function for future use
3. Remove `SUPABASE_SERVICE_ROLE_KEY` environment variable if not used elsewhere

## Benefits

- 🚀 **Works in production** - No more read-only filesystem errors
- 🌍 **Global CDN** - Supabase provides automatic CDN distribution
- 💾 **Persistent** - Files survive deployments and server restarts
- 🔒 **Secure** - Service role key kept server-side only
- 📦 **Scalable** - No local disk space limitations
- 🔄 **Automatic backups** - Supabase handles data redundancy

## Troubleshooting

### "Missing Supabase URL or Service Role Key" Error

**Solution**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in your production environment variables.

### Images Not Loading

**Solution**: Verify the Supabase project URL in `next.config.ts` matches your project:
```ts
{
  protocol: "https",
  hostname: "your-project-id.supabase.co",
}
```

### Upload Fails with "Failed to create bucket"

**Solution**: Manually create the `gallery-images` bucket in Supabase Dashboard with public access enabled.

### TypeScript Errors

**Solution**: The return type of `uploadGalleryImageAction` now includes `url?`:
```ts
{ success: true, fileName: string, url: string } | { success: false, error: string }
```

## Support

For issues related to:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs/guides/storage)
- **Next.js**: Check [Next.js Image Documentation](https://nextjs.org/docs/app/api-reference/components/image)
- **This Implementation**: Review the code comments in the modified files
