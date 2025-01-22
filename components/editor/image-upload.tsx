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
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageUploaded: (imageData: {
    url: string;
    alt: string;
    title: string;
    description: string;
    width: number;
    height: number;
    loading: 'lazy' | 'eager';
  }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCoverImage?: boolean;
}

interface ImageMetadata {
  alt: string;
  title: string;
  description: string;
  fileName: string;
  originalFileName: string;
  width: number;
  height: number;
  loading: 'lazy' | 'eager';
  compressionLevel: 'low' | 'medium' | 'high';
}

export function ImageUpload({ onImageUploaded, open, onOpenChange, isCoverImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata>({
    alt: '',
    title: '',
    description: '',
    fileName: '',
    originalFileName: '',
    width: 0,
    height: 0,
    loading: 'lazy',
    compressionLevel: 'medium'
  });
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const optimizeFileName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace special characters with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
  };

  const resetState = () => {
    setPreview(null);
    setUploadedUrl(null);
    setDimensions(null);
    setMetadata({
      alt: '',
      title: '',
      description: '',
      fileName: '',
      originalFileName: '',
      width: 0,
      height: 0,
      loading: 'lazy',
      compressionLevel: 'medium'
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploading(true);
      // Create a preview and get dimensions
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        setMetadata(prev => ({
          ...prev,
          width: img.width,
          height: img.height
        }));
      };
      img.src = objectUrl;

      // Generate optimized filename
      const extension = file.name.split('.').pop() || '';
      const optimizedName = optimizeFileName(file.name.split('.')[0]) + '.' + extension;
      
      // Upload the image
      const path = generateStoragePath('blog-images', optimizedName);
      const imageUrl = await uploadImage(file, path);
      
      setUploadedUrl(imageUrl);
      setMetadata(prev => ({
        ...prev,
        fileName: optimizedName,
        originalFileName: file.name,
        title: file.name.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' '),
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  }, []);

  // Add compression handler
  const compressImage = async (file: File, level: 'low' | 'medium' | 'high'): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Scale down based on compression level
        const scale = level === 'low' ? 0.9 : level === 'medium' ? 0.7 : 0.5;
        width *= scale;
        height *= scale;
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not compress image'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          level === 'low' ? 0.8 : level === 'medium' ? 0.6 : 0.4
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleInsert = async () => {
    if (!uploadedUrl) return;
    
    onImageUploaded({
      url: uploadedUrl,
      alt: metadata.alt,
      title: metadata.title,
      description: metadata.description,
      width: metadata.width,
      height: metadata.height,
      loading: metadata.loading
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
          <DialogTitle>{isCoverImage ? 'Upload Cover Image' : 'Upload Image'}</DialogTitle>
          {isCoverImage && (
            <p className="text-sm text-muted-foreground mt-2">
              Cover images should be high quality and have a 16:9 aspect ratio for best results.
              Recommended size: 1920x1080px.
            </p>
          )}
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div
              {...getRootProps()}
              className={`
                flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed p-6 cursor-pointer
                transition-colors duration-200 min-h-[300px]
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                ${isCoverImage ? 'aspect-video' : ''}
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
                  className={cn(
                    "max-h-[260px] w-auto rounded-lg object-contain shadow-lg transition-transform duration-200 hover:scale-[1.02]",
                    isCoverImage && "w-full h-full object-cover"
                  )}
                />
              ) : (
                <>
                  <div className="p-4 rounded-full bg-muted/30">
                    <ImagePlus className="h-8 w-8 text-muted-foreground/70" />
                  </div>
                  <div className="mt-4 space-y-2 text-center">
                    <p className="text-base font-medium">
                      Drop your {isCoverImage ? 'cover ' : ''}image here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse from your computer
                    </p>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground/75 space-y-1">
                    <p>You can also paste an image directly (Ctrl/Cmd + V)</p>
                    <p>Supports: JPG, PNG, GIF and WEBP</p>
                    {isCoverImage && (
                      <p className="text-primary/80">Recommended: 1920x1080px (16:9)</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fileName">File Name</Label>
              <div className="flex gap-2">
                <Input
                  id="fileName"
                  value={metadata.fileName}
                  onChange={(e) => setMetadata(prev => ({ ...prev, fileName: optimizeFileName(e.target.value) }))}
                  placeholder="Optimized file name"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMetadata(prev => ({ ...prev, fileName: optimizeFileName(metadata.originalFileName) }))}
                  className="whitespace-nowrap"
                >
                  Reset
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                SEO-friendly file name. Will be automatically optimized.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Image title"
              />
              <p className="text-xs text-muted-foreground">
                A concise title that describes the image content.
              </p>
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
                Descriptive alt text improves accessibility and SEO. Include relevant keywords naturally.
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
                Detailed description for captions and SEO. Use relevant keywords and natural language.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dimensions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="number"
                      value={metadata.width}
                      onChange={(e) => setMetadata(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                      placeholder="Width"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={metadata.height}
                      onChange={(e) => setMetadata(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                      placeholder="Height"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Loading</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={metadata.loading}
                  onChange={(e) => setMetadata(prev => ({ ...prev, loading: e.target.value as 'lazy' | 'eager' }))}
                >
                  <option value="lazy">Lazy Load</option>
                  <option value="eager">Eager Load</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Compression Level</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={metadata.compressionLevel}
                onChange={(e) => setMetadata(prev => ({ ...prev, compressionLevel: e.target.value as 'low' | 'medium' | 'high' }))}
              >
                <option value="low">Low Compression</option>
                <option value="medium">Medium Compression</option>
                <option value="high">High Compression</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Higher compression reduces file size but may affect image quality.
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
            {isCoverImage ? 'Set Cover Image' : 'Insert Image'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 