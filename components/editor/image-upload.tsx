'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { uploadImage, generateStoragePath } from '@/lib/storage-utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ImageUploadProps {
  onImageUploaded: (imageData: {
    url: string;
    alt: string;
    title: string;
    description: string;
  }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImageMetadata {
  alt: string;
  title: string;
  description: string;
}

export function ImageUpload({ onImageUploaded, open, onOpenChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata>({
    alt: '',
    title: '',
    description: '',
  });

  const resetState = () => {
    setPreview(null);
    setUploadedUrl(null);
    setMetadata({
      alt: '',
      title: '',
      description: '',
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploading(true);
      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload the image
      const path = generateStoragePath('blog-images', file.name);
      const imageUrl = await uploadImage(file, path);
      
      setUploadedUrl(imageUrl);
      // Set default title from filename
      setMetadata(prev => ({
        ...prev,
        title: file.name.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' '),
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleInsert = () => {
    if (!uploadedUrl) return;
    
    onImageUploaded({
      url: uploadedUrl,
      ...metadata,
    });
    onOpenChange(false);
    resetState();
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div
              {...getRootProps()}
              className={`
                flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed p-6 cursor-pointer
                transition-colors duration-200 min-h-[300px]
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              `}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              ) : preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-[260px] w-auto rounded-lg object-contain shadow-lg transition-transform duration-200 hover:scale-[1.02]"
                />
              ) : (
                <>
                  <div className="p-4 rounded-full bg-muted/30">
                    <ImagePlus className="h-8 w-8 text-muted-foreground/70" />
                  </div>
                  <div className="mt-4 space-y-2 text-center">
                    <p className="text-base font-medium">
                      Drop your image here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse from your computer
                    </p>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground/75 space-y-1">
                    <p>You can also paste an image directly (Ctrl/Cmd + V)</p>
                    <p>Supports: JPG, PNG, GIF and WEBP</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Image title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={metadata.alt}
                onChange={(e) => setMetadata(prev => ({ ...prev, alt: e.target.value }))}
                placeholder="Describe the image for screen readers"
              />
              <p className="text-xs text-muted-foreground">
                Describe the image for accessibility. This helps users who use screen readers and improves SEO.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a detailed description of the image"
                className="h-24 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Provide additional context about the image. This can be used for captions or detailed descriptions.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInsert}
            disabled={!uploadedUrl || !metadata.alt.trim()}
          >
            Insert Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 