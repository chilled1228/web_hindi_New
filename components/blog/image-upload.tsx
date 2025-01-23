import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { uploadImage, generateStoragePath } from '@/lib/storage-utils';

export interface ImageUploadProps {
  onChange: (url: string) => void;
  onRemove: () => void;
  value?: string;
}

export function ImageUpload({ onChange, onRemove, value }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setPreview(value);
    }
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const path = generateStoragePath('prompt-images', file.name);
      const imageUrl = await uploadImage(file, path);
      onChange(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      // You might want to add proper error handling here
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2`}>
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="max-w-[300px]"
      />
      {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  );
} 