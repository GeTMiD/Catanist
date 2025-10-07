/**
 * ImageUpload Component
 * 
 * A reusable component for uploading images with drag-and-drop support,
 * preview functionality, and validation.
 * 
 * Features:
 * - Drag and drop support
 * - Image preview
 * - File validation (type and size)
 * - Loading states
 * - Error handling
 * 
 * @component
 * @example
 * ```tsx
 * <ImageUpload
 *   onImageUpload={(url) => console.log('Image uploaded:', url)}
 *   currentImage={existingImageUrl}
 *   onImageRemove={() => console.log('Image removed')}
 * />
 * ```
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateImageFile, uploadPuzzleImage, deletePuzzleImage } from "@/utils/imageUpload";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  /** Callback fired when image is successfully uploaded */
  onImageUpload: (imageUrl: string) => void;
  /** Current image URL to display (optional) */
  currentImage?: string;
  /** Callback fired when image is removed */
  onImageRemove?: () => void;
  /** Custom className for styling */
  className?: string;
  /** User ID for organizing uploads (required for auth) */
  userId?: string;
}

const ImageUpload = ({
  onImageUpload,
  currentImage,
  onImageRemove,
  className,
  userId = "anonymous", // Temporary fallback - will need auth later
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  /**
   * Handles file selection and upload
   */
  const handleFileSelect = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    setIsUploading(true);
    try {
      const imageUrl = await uploadPuzzleImage(file, userId);
      
      if (imageUrl) {
        onImageUpload(imageUrl);
        toast({
          title: "Image uploaded",
          description: "Your puzzle image has been uploaded successfully",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image",
        variant: "destructive",
      });
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handles image removal
   */
  const handleRemoveImage = async () => {
    if (currentImage) {
      const success = await deletePuzzleImage(currentImage);
      if (!success) {
        toast({
          title: "Delete failed",
          description: "Could not delete the image",
          variant: "destructive",
        });
        return;
      }
    }
    
    setPreview(null);
    onImageRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Drag and drop handlers
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        {preview ? (
          // Preview State
          <div className="relative group">
            <img
              src={preview}
              alt="Puzzle preview"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                disabled={isUploading}
              >
                <X className="mr-2 h-4 w-4" />
                Remove Image
              </Button>
            </div>
          </div>
        ) : (
          // Upload State
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />
            
            <div className="flex flex-col items-center gap-4">
              {isUploading ? (
                <Upload className="w-12 h-12 text-primary animate-pulse" />
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              )}
              
              <div>
                <p className="text-lg font-medium mb-1">
                  {isUploading ? "Uploading..." : "Upload Puzzle Image"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  JPEG, PNG, or WebP • Max 5MB
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
