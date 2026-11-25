# 🚀 Deployment Checklist - Gallery Storage Fix

## Pre-Deployment

- [ ] Verify all changes are committed to git
- [ ] Test locally that gallery upload/delete works
- [ ] Ensure `.env.local` has all required Supabase credentials

## Environment Variables (Production)

Add these to your production environment (Vercel/AWS/etc.):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  ⚠️ CRITICAL - New variable!
```

### Where to add environment variables:

**Vercel:**
1. Project Settings → Environment Variables
2. Add `SUPABASE_SERVICE_ROLE_KEY`
3. Apply to Production, Preview, and Development

**Other Platforms:**
- Check your hosting platform's documentation for adding environment variables

## Post-Deployment Testing

1. **Login to Admin Panel**
   - URL: `https://your-domain.com/admin/login`
   - Navigate to Gallery section

2. **Test Upload**
   - [ ] Upload a new test image
   - [ ] Verify it appears in the gallery
   - [ ] Check the image URL (should be Supabase URL, not `/uploads/`)

3. **Test Delete** ✅ (This was broken before)
   - [ ] Delete the test image
   - [ ] Should NOT see EROFS error
   - [ ] Image should disappear from gallery

4. **Verify Persistence**
   - [ ] Trigger a redeploy
   - [ ] Verify uploaded images are still accessible

## Supabase Dashboard Verification

1. Go to Supabase Dashboard → Storage
2. Verify `gallery-images` bucket exists
3. Check that uploaded images appear in the bucket
4. Verify deleted images are removed from the bucket

## Known Issues

- **Node.js version warning**: The build shows warnings about Node.js 20 deprecation. Consider upgrading to Node.js 22+ in future deployments.

## Rollback Plan

If issues occur:

1. Revert to previous deployment
2. Check error logs for specific issues
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is correctly set
4. Contact support with error messages

## Success Criteria

✅ Upload works without errors  
✅ Delete works without EROFS error  
✅ Images persist across deployments  
✅ Image URLs point to Supabase CDN  
✅ No console errors in browser or server logs  

## Notes

- Old images in `public/uploads/gallery/` will NOT be automatically migrated
- Those images will continue to work if they exist in your repository
- New uploads will go to Supabase Storage
- Consider migrating old images manually if needed (see GALLERY_STORAGE_SETUP.md)

## Support

If you encounter issues, check:
1. Browser console for client-side errors
2. Vercel/server logs for server-side errors
3. Supabase Dashboard → Storage for upload confirmation
4. `GALLERY_STORAGE_SETUP.md` for detailed troubleshooting
