import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Loader2, ImagePlus } from 'lucide-react';
import { uploadImage, generateStoragePath } from '@/lib/storage-utils';
import { cn } from '@/lib/utils';

export interface MultiImageUploadProps {
  onImagesSelected: (urls: string[]) => void;
  disabled?: boolean;
}

export function MultiImageUpload({ onImagesSelected, disabled }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || !acceptedFiles.length) return;

    try {
      setIsUploading(true);
      const uploadPromises = acceptedFiles.map(async (file) => {
        const path = generateStoragePath('prompt-images', file.name);
        return uploadImage(file, path);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesSelected(uploadedUrls);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  }, [disabled, onImagesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    disabled: isUploading || disabled,
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'h-full w-full flex flex-col items-center justify-center p-4 cursor-pointer',
        'transition-colors duration-200',
        isDragActive ? 'bg-primary/5' : 'hover:bg-muted/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        <>
          <ImagePlus className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-xs text-center text-muted-foreground">
            Drop images here or click to upload
          </p>
        </>
      )}
    </div>
  );
} 