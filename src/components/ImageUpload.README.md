# ImageUpload Component

A fully-featured, reusable image upload component with drag-and-drop support, validation, and preview.

## Quick Start

```tsx
import ImageUpload from "@/components/ImageUpload";

function MyForm() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <ImageUpload
      onImageUpload={setImageUrl}
      currentImage={imageUrl}
      onImageRemove={() => setImageUrl("")}
      userId="user-123"
    />
  );
}
```

## Features

✅ Drag and drop upload  
✅ Click to browse files  
✅ Image preview with hover controls  
✅ File type validation (JPEG, PNG, WebP)  
✅ File size validation (max 5MB)  
✅ Loading states  
✅ Error handling with toast notifications  
✅ Accessible and keyboard-friendly  

## Props API

### `onImageUpload` (required)

**Type**: `(imageUrl: string) => void`

Callback function called when an image is successfully uploaded. Receives the public URL of the uploaded image.

```tsx
<ImageUpload onImageUpload={(url) => console.log(url)} />
```

### `currentImage` (optional)

**Type**: `string`

URL of an existing image to display in preview mode.

```tsx
<ImageUpload 
  currentImage="https://example.com/image.jpg"
  onImageUpload={handleUpload}
/>
```

### `onImageRemove` (optional)

**Type**: `() => void`

Callback function called when the user removes the current image.

```tsx
<ImageUpload 
  onImageRemove={() => setImageUrl("")}
  onImageUpload={handleUpload}
/>
```

### `userId` (optional)

**Type**: `string`  
**Default**: `"anonymous"`

User ID for organizing uploaded files in storage. Files are stored in `{userId}/` folders.

```tsx
<ImageUpload 
  userId={currentUser.id}
  onImageUpload={handleUpload}
/>
```

### `className` (optional)

**Type**: `string`

Additional CSS classes for custom styling.

```tsx
<ImageUpload 
  className="my-4 border-dashed"
  onImageUpload={handleUpload}
/>
```

## States

### Empty State
Shows upload dropzone with instructions.

### Uploading State
Shows loading spinner with "Uploading..." text.

### Preview State
Shows uploaded image with hover-to-remove control.

## Validation

### Allowed File Types
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`

### File Size Limit
Maximum 5MB per file.

### Error Messages
- "Invalid file type. Please upload a JPEG, PNG, or WebP image."
- "File size must be less than 5MB"
- "Upload failed: There was an error uploading your image"
- "Delete failed: Could not delete the image"

## Styling

The component uses Tailwind CSS and follows the app's design system:

- Card wrapper for consistent appearance
- Hover states for interactive elements
- Smooth transitions
- Responsive design
- Theme-aware colors

### Customization

```tsx
// Adjust height
<ImageUpload className="h-80" />

// Add margin
<ImageUpload className="mb-6" />

// Full width
<ImageUpload className="w-full" />
```

## Storage Integration

Files are uploaded to the `puzzle-images` bucket in Supabase Storage with:

- Public read access
- Authenticated write access
- User-specific folders
- 1-hour cache control
- Unique timestamped filenames

## Accessibility

- Keyboard navigation support
- Hidden file input with click trigger
- Clear visual feedback
- Screen reader friendly labels
- Focus management

## Dependencies

- `@/components/ui/button` - Button component
- `@/components/ui/card` - Card wrapper
- `lucide-react` - Icons
- `@/utils/imageUpload` - Upload utilities
- `@/hooks/use-toast` - Toast notifications

## Related Files

- `src/utils/imageUpload.ts` - Upload utility functions
- `src/pages/Create.tsx` - Example usage
- `docs/IMAGE_UPLOAD_GUIDE.md` - Full documentation

## Code Structure

```typescript
ImageUpload
├── State Management
│   ├── isDragging (drag state)
│   ├── isUploading (loading state)
│   └── preview (preview URL)
├── File Handling
│   ├── handleFileSelect (main upload logic)
│   ├── handleRemoveImage (deletion)
│   └── validateImageFile (validation)
├── Drag & Drop
│   ├── handleDragOver
│   ├── handleDragLeave
│   └── handleDrop
└── Render
    ├── Preview Mode (when image exists)
    └── Upload Mode (drag/drop zone)
```

## Common Patterns

### With Form

```tsx
function PuzzleForm() {
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
  });

  return (
    <form>
      <Input 
        value={formData.title}
        onChange={(e) => setFormData(prev => ({
          ...prev, 
          title: e.target.value
        }))}
      />
      
      <ImageUpload
        onImageUpload={(url) => setFormData(prev => ({
          ...prev,
          imageUrl: url
        }))}
        currentImage={formData.imageUrl}
        onImageRemove={() => setFormData(prev => ({
          ...prev,
          imageUrl: ""
        }))}
      />
    </form>
  );
}
```

### With Authentication

```tsx
import { supabase } from "@/integrations/supabase/client";

function AuthenticatedUpload() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <ImageUpload
      userId={user?.id || "anonymous"}
      onImageUpload={handleUpload}
    />
  );
}
```

### Multiple Instances

```tsx
function MultipleImages() {
  const [heroImage, setHeroImage] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState("");

  return (
    <>
      <Label>Hero Image</Label>
      <ImageUpload
        onImageUpload={setHeroImage}
        currentImage={heroImage}
        userId="user-123"
      />

      <Label>Thumbnail</Label>
      <ImageUpload
        onImageUpload={setThumbnailImage}
        currentImage={thumbnailImage}
        userId="user-123"
        className="h-40"
      />
    </>
  );
}
```

## Troubleshooting

### Image doesn't upload

1. Check console for errors
2. Verify user authentication
3. Check storage bucket permissions
4. Verify file meets validation rules

### Preview not showing

1. Verify `currentImage` prop is set
2. Check image URL is accessible
3. Check browser console for CORS errors

### Drag and drop not working

1. Verify browser supports drag events
2. Check no parent element prevents events
3. Test with file input as fallback
