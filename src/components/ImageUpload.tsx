import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  userId: string;
  currentImage?: string;
  onImageUpload: (url: string) => void;
  onImageRemove: () => void;
}

const ImageUpload = ({ userId, currentImage, onImageUpload, onImageRemove }: ImageUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `puzzles/${fileName}`;    
      const { error } = await supabase.storage.from("puzzle_images").upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage.from("puzzle_images").getPublicUrl(filePath);
      onImageUpload(data.publicUrl);

      toast({
        title: "Upload complete",
        description: "Your image was successfully uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="image-upload">Upload Image</Label>
      {!currentImage ? (
        <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      ) : (
        <div className="relative w-48 h-48 border rounded-md overflow-hidden">
          <img src={currentImage} alt="Uploaded puzzle" className="object-cover w-full h-full" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute bottom-2 right-2"
            onClick={onImageRemove}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
