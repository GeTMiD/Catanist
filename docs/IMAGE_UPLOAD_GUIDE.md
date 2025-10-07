# Image Upload System Documentation

## Overview

This guide explains the image upload system for puzzle images in the Catan Puzzle Trainer. The system is built to be maintainable, reusable, and easy to extend.

## Architecture

### Components

```
src/
├── components/
│   └── ImageUpload.tsx          # Reusable upload component
├── utils/
│   └── imageUpload.ts           # Upload utility functions
└── pages/
    └── Create.tsx               # Example usage
```

### Storage

- **Bucket**: `puzzle-images`
- **Public Access**: Yes (images are viewable by everyone)
- **Upload Access**: Authenticated users only
- **Organization**: Files stored by user ID in folders

## Using the ImageUpload Component

### Basic Usage

```tsx
import ImageUpload from "@/components/ImageUpload";

function MyComponent() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <ImageUpload
      onImageUpload={(url) => setImageUrl(url)}
      currentImage={imageUrl}
      onImageRemove={() => setImageUrl("")}
      userId="user-123"
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onImageUpload` | `(url: string) => void` | Yes | Callback when upload succeeds |
| `currentImage` | `string` | No | URL of existing image to display |
| `onImageRemove` | `() => void` | No | Callback when image is removed |
| `userId` | `string` | No | User ID for organizing uploads |
| `className` | `string` | No | Additional CSS classes |

## Utility Functions

### `validateImageFile(file: File)`

Validates an image file before upload.

**Validation Rules:**
- File types: JPEG, JPG, PNG, WebP
- Max size: 5MB

**Returns:**
```typescript
{
  isValid: boolean;
  error?: string;
}
```

### `uploadPuzzleImage(file: File, userId: string)`

Uploads an image to storage.

**Returns:** `Promise<string | null>` - Public URL or null on failure

**Example:**
```typescript
const url = await uploadPuzzleImage(file, "user-123");
if (url) {
  console.log("Uploaded:", url);
}
```

### `deletePuzzleImage(imageUrl: string)`

Deletes an image from storage.

**Returns:** `Promise<boolean>` - Success indicator

## Storage Security

### Row Level Security Policies

1. **Upload Policy**: Authenticated users can upload images
2. **View Policy**: Public can view all images
3. **Delete Policy**: Users can only delete their own images

### File Organization

Files are stored with this structure:
```
puzzle-images/
  └── {userId}/
      └── {timestamp}-{random}.{ext}
```

## Adding New Features

### 1. Multiple Image Upload

Update the component to handle arrays:

```typescript
// In ImageUpload.tsx
interface ImageUploadProps {
  onImageUpload: (urls: string[]) => void;  // Array instead of string
  maxImages?: number;
}
```

### 2. Image Cropping

Add a cropping library:

```bash
npm install react-easy-crop
```

Then integrate in the upload flow:

```typescript
import Cropper from 'react-easy-crop';

// Add cropping step before upload
const handleCrop = async (croppedArea) => {
  const croppedImage = await getCroppedImg(preview, croppedArea);
  await uploadPuzzleImage(croppedImage, userId);
};
```

### 3. Progress Tracking

Use Supabase's upload progress callback:

```typescript
const { data, error } = await supabase.storage
  .from('puzzle-images')
  .upload(fileName, file, {
    onUploadProgress: (progress) => {
      const percent = (progress.loaded / progress.total) * 100;
      setUploadProgress(percent);
    }
  });
```

### 4. Image Compression

Add compression before upload:

```bash
npm install browser-image-compression
```

```typescript
import imageCompression from 'browser-image-compression';

const compressedFile = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
});
```

## Error Handling

The system includes comprehensive error handling:

1. **Validation Errors**: Show toast with specific issue
2. **Upload Errors**: Log and show user-friendly message
3. **Network Errors**: Caught and logged to console

## Testing Checklist

- [ ] Upload valid image (JPEG, PNG, WebP)
- [ ] Try uploading file > 5MB (should reject)
- [ ] Try uploading non-image file (should reject)
- [ ] Test drag and drop
- [ ] Test click to browse
- [ ] Test image removal
- [ ] Test preview display
- [ ] Check loading states

## Future Enhancements

### Recommended Additions

1. **Image Optimization**: Automatic resizing/compression
2. **Thumbnails**: Generate small versions for lists
3. **AI Validation**: Verify images contain Catan boards
4. **Batch Upload**: Multiple images at once
5. **Edit Metadata**: Add captions, alt text

### When Authentication is Added

Update the `userId` prop to use real auth:

```typescript
// In Create.tsx
import { supabase } from "@/integrations/supabase/client";

const { data: { user } } = await supabase.auth.getUser();

<ImageUpload
  userId={user?.id || "anonymous"}
  // ...other props
/>
```

## Troubleshooting

### Images not displaying

1. Check if bucket is public
2. Verify RLS policies
3. Check URL format in browser console

### Upload fails

1. Check file size/type
2. Verify user authentication
3. Check storage quota
4. Review console errors

### Permission errors

1. Verify RLS policies are correct
2. Check user authentication status
3. Ensure userId matches auth.uid()

## Performance Considerations

- **Lazy Loading**: Images load on-demand
- **Caching**: Browser caches with 1-hour TTL
- **CDN**: Supabase storage includes CDN
- **Compression**: Consider adding before upload

## Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [React Image Upload Best Practices](https://web.dev/image-upload/)
- [Image Optimization Guide](https://web.dev/fast/)
