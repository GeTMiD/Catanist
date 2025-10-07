/**
 * Image Upload Utilities
 * 
 * This module provides utility functions for handling image uploads to storage.
 * It includes validation, compression, and upload functionality.
 * 
 * @module imageUpload
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Maximum file size in bytes (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed image MIME types
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Validates an image file before upload
 * 
 * @param file - The file to validate
 * @returns Object with isValid boolean and optional error message
 * 
 * @example
 * const validation = validateImageFile(file);
 * if (!validation.isValid) {
 *   console.error(validation.error);
 * }
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: "No file provided" };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: "Invalid file type. Please upload a JPEG, PNG, or WebP image." 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
    };
  }

  return { isValid: true };
};

/**
 * Uploads an image file to the puzzle-images storage bucket
 * 
 * @param file - The image file to upload
 * @param userId - The ID of the user uploading the image
 * @returns Promise with the public URL of the uploaded image or null if failed
 * 
 * @example
 * const url = await uploadPuzzleImage(file, userId);
 * if (url) {
 *   console.log('Image uploaded:', url);
 * }
 */
export const uploadPuzzleImage = async (
  file: File,
  userId: string
): Promise<string | null> => {
  try {
    // Validate file before upload
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create unique filename with timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('puzzle-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('puzzle-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

/**
 * Deletes an image from storage given its URL
 * 
 * @param imageUrl - The public URL of the image to delete
 * @returns Promise indicating success or failure
 * 
 * @example
 * const success = await deletePuzzleImage(imageUrl);
 * if (success) {
 *   console.log('Image deleted successfully');
 * }
 */
export const deletePuzzleImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract path from public URL
    const url = new URL(imageUrl);
    const path = url.pathname.split('/puzzle-images/')[1];
    
    if (!path) {
      throw new Error('Invalid image URL');
    }

    const { error } = await supabase.storage
      .from('puzzle-images')
      .remove([path]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};
