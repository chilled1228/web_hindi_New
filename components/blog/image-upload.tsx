import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { uploadImage, generateStoragePath } from '@/lib/storage-utils';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  className?: string;
}

export function ImageUpload({ onImageUploaded, className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const path = generateStoragePath('blog-images', file.name);
      const imageUrl = await uploadImage(file, path);
      onImageUploaded(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      // You might want to add proper error handling here
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="max-w-[300px]"
      />
      {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  );
} 