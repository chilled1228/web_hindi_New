'use client';

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Plus,
  Type,
  Pilcrow,
  ImagePlus,
  Table,
  ListChecks,
  Code2,
  Quote as QuoteIcon,
  Loader2,
  PanelTop,
  PanelTopClose,
  ChevronUp,
  ChevronDown,
  Layout,
  LayoutGrid,
  MenuSquare,
  Monitor,
  Tablet,
  Settings2,
  ImageDown,
  ImageUp,
  Maximize2,
  Minimize2,
  Move,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect } from 'react';
import { ImageUpload } from './editor/image-upload';
import { generateStoragePath, uploadImage } from '@/lib/storage-utils';
import { Editor as TipTapEditor } from '@tiptap/react';

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  onCoverImageChange?: (imageData: ImageData | null) => void;
  coverImage?: ImageData | null;
}

interface ImageData {
  url: string;
  alt: string;
  title: string;
  description: string;
  width: number;
  height: number;
  loading: 'lazy' | 'eager';
}

interface ExtendedImageOptions {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  class?: string;
}

type ToolbarPosition = 'top' | 'side';

// Define image size options
type ImageSize = 'small' | 'medium' | 'large' | 'original';

export default function Editor({ value, onChange, onCoverImageChange, coverImage }: EditorProps) {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showCoverImageUpload, setShowCoverImageUpload] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [editorInstance, setEditorInstance] = useState<TipTapEditor | null>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize>('medium');
  const [imageAlignment, setImageAlignment] = useState<'left' | 'center' | 'right'>('center');
  
  // Initialize toolbar settings from localStorage or use defaults
  const [showToolbar, setShowToolbar] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('editorShowToolbar');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('editorToolbarPosition');
      return (saved === 'top' || saved === 'side') ? saved as ToolbarPosition : 'top';
    }
    return 'top';
  });

  // Save preferences when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('editorShowToolbar', showToolbar.toString());
    }
  }, [showToolbar]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('editorToolbarPosition', toolbarPosition);
    }
  }, [toolbarPosition]);

  // Toggle toolbar visibility
  const toggleToolbar = useCallback(() => {
    setShowToolbar(prev => !prev);
  }, []);

  // Toggle toolbar position
  const toggleToolbarPosition = useCallback(() => {
    setToolbarPosition(prev => prev === 'top' ? 'side' : 'top');
  }, []);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItem = Array.from(items).find(item => item.type.startsWith('image'));
    if (!imageItem) return;

    e.preventDefault();
    setPasting(true);

    try {
      const file = imageItem.getAsFile();
      if (!file) return;

      const path = generateStoragePath('blog-images', `pasted-${Date.now()}.png`);
      const imageUrl = await uploadImage(file, path);
      
      const imageData: ImageData = {
        url: imageUrl,
        alt: 'Pasted image',
        title: 'Pasted image',
        description: '',
        width: 0,
        height: 0,
        loading: 'lazy',
      };
      
      editorInstance?.chain().focus().setImage({
        src: imageData.url,
        alt: imageData.alt,
        title: imageData.title,
        width: imageData.width,
        height: imageData.height,
        loading: imageData.loading,
      } as ExtendedImageOptions).run();
    } catch (error) {
      console.error('Error uploading pasted image:', error);
    } finally {
      setPasting(false);
    }
  }, [editorInstance]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full mx-auto',
          draggable: 'false',
          loading: 'lazy',
        },
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4 hover:text-primary/80',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return "What's the title?"
          }
          return 'Start writing or type "/" for commands...'
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      setEditorInstance(editor);
    },
    onDestroy: () => {
      setEditorInstance(null);
    },
    onSelectionUpdate: ({ editor }) => {
      // Check if an image is selected
      const node = editor.view.state.selection.$anchor.nodeAfter;
      if (node && node.type.name === 'image') {
        // Find the DOM element for the selected image
        const domNode = editor.view.nodeDOM(editor.view.state.selection.$anchor.pos) as HTMLElement;
        if (domNode) {
          const img = domNode.querySelector('img');
          if (img) {
            setSelectedImage(img);
            
            // Determine current size and alignment
            const classList = img.className.split(' ');
            if (classList.includes('w-1/4')) setImageSize('small');
            else if (classList.includes('w-1/2')) setImageSize('medium');
            else if (classList.includes('w-full')) setImageSize('large');
            else setImageSize('original');
            
            if (classList.includes('mx-auto')) setImageAlignment('center');
            else if (classList.includes('ml-auto')) setImageAlignment('right');
            else setImageAlignment('left');
            
            return;
          }
        }
      }
      setSelectedImage(null);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none',
      },
      handlePaste: (view, event, slice) => {
        // Handle image paste
        const items = event.clipboardData?.items;
        if (items) {
          const imageItem = Array.from(items).find(item => item.type.startsWith('image'));
          if (imageItem) {
            handlePaste(event);
            return true;
          }
        }

        // Handle HTML paste
        const html = event.clipboardData?.getData('text/html');
        if (html) {
          try {
            // Clean and sanitize HTML content
            const cleanHtml = html
              .replace(/<meta[^>]*>/g, '') // Remove meta tags
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
              .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
              .replace(/class="[^"]*"/g, '') // Remove classes
              .replace(/style="[^"]*"/g, ''); // Remove inline styles

            // Create a temporary div to hold the content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cleanHtml;

            // Process common formatting elements
            const processNode = (node: Element) => {
              // Convert deprecated tags to modern equivalents
              const tagMappings: Record<string, string> = {
                'b': 'strong',
                'i': 'em',
                'strike': 'del',
              };

              // Handle block-level elements
              const blockElements = ['p', 'h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'li'];

              Array.from(node.children).forEach(child => {
                if (child instanceof Element) {
                  const tagName = child.tagName.toLowerCase();
                  
                  // Convert deprecated inline tags
                  if (tagMappings[tagName]) {
                    const newElement = document.createElement(tagMappings[tagName]);
                    newElement.innerHTML = child.innerHTML;
                    child.parentNode?.replaceChild(newElement, child);
                  }
                  
                  // Handle divs and other non-block elements
                  if (!blockElements.includes(tagName)) {
                    // Only wrap in paragraph if it's not already wrapped
                    if (child.parentElement?.tagName.toLowerCase() !== 'p') {
                      const p = document.createElement('p');
                      child.parentNode?.replaceChild(p, child);
                      p.appendChild(child);
                    }
                  }
                  
                  processNode(child);
                }
              });

              // If the node has direct text nodes, wrap them in paragraphs
              Array.from(node.childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
                  const p = document.createElement('p');
                  p.textContent = child.textContent;
                  child.parentNode?.replaceChild(p, child);
                }
              });
            };

            processNode(tempDiv);

            // Handle plain text content
            if (!tempDiv.innerHTML.trim()) {
              const plainText = event.clipboardData?.getData('text/plain');
              if (plainText) {
                // Split by double newlines to create paragraphs
                const paragraphs = plainText.split(/\n\s*\n/);
                tempDiv.innerHTML = paragraphs
                  .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
                  .join('');
              }
            }

            // Use the editor's insertContent method for better parsing
            editor?.commands.insertContent(tempDiv.innerHTML, {
              parseOptions: {
                preserveWhitespace: 'full',
              },
            });

            return true;
          } catch (error) {
            console.error('Error processing pasted content:', error);
            // Fallback to plain text paste
            const plainText = event.clipboardData?.getData('text/plain');
            if (plainText) {
              editor?.commands.insertContent(plainText);
            }
            return true;
          }
        }

        // Handle plain text paste
        const plainText = event.clipboardData?.getData('text/plain');
        if (plainText) {
          // Split by double newlines to create paragraphs
          const paragraphs = plainText.split(/\n\s*\n/);
          const content = paragraphs
            .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
            .join('');
          editor?.commands.insertContent(content);
          return true;
        }

        return false;
      }
    },
  });

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (document.activeElement?.closest('.ProseMirror')) {
        handlePaste(e);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [handlePaste]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // Function to apply image size
  const applyImageSize = (size: ImageSize) => {
    if (!editor || !selectedImage) return;
    
    // Get the current node position
    const { state } = editor.view;
    const pos = state.selection.$anchor.pos;
    
    // Remove existing size classes
    let classes = selectedImage.className
      .replace(/\bw-1\/4\b|\bw-1\/2\b|\bw-full\b|\bw-auto\b/g, '')
      .trim();
    
    // Add new size class
    switch (size) {
      case 'small':
        classes += ' w-1/4';
        break;
      case 'medium':
        classes += ' w-1/2';
        break;
      case 'large':
        classes += ' w-full';
        break;
      case 'original':
        classes += ' w-auto';
        break;
    }
    
    // Update the image attributes
    editor.chain().focus().setNodeSelection(pos).run();
    editor.chain().focus().updateAttributes('image', { class: classes }).run();
    setImageSize(size);
  };

  // Function to apply image alignment
  const applyImageAlignment = (alignment: 'left' | 'center' | 'right') => {
    if (!editor || !selectedImage) return;
    
    // Get the current node position
    const { state } = editor.view;
    const pos = state.selection.$anchor.pos;
    
    // Remove existing alignment classes
    let classes = selectedImage.className
      .replace(/\bmx-auto\b|\bml-auto\b|\bfloat-left\b|\bfloat-right\b|\bblock\b/g, '')
      .trim();
    
    // Add new alignment class
    switch (alignment) {
      case 'left':
        classes += ' float-left mr-4';
        break;
      case 'center':
        classes += ' mx-auto block';
        break;
      case 'right':
        classes += ' float-right ml-4';
        break;
    }
    
    // Update the image attributes
    editor.chain().focus().setNodeSelection(pos).run();
    editor.chain().focus().updateAttributes('image', { class: classes }).run();
    setImageAlignment(alignment);
  };

  const addImage = (imageData: ImageData) => {
    editor?.chain().focus().setImage({
      src: imageData.url,
      alt: imageData.alt,
      title: imageData.title,
      width: imageData.width,
      height: imageData.height,
      loading: imageData.loading,
      class: 'w-1/2 mx-auto rounded-lg', // Default to medium size and centered
    } as ExtendedImageOptions).run();

    if (imageData.description) {
      editor.chain()
        .focus()
        .insertContent('<figcaption class="text-center text-sm text-muted-foreground mt-2">' + imageData.description + '</figcaption>')
        .run();
    }
  };

  return (
    <div className="relative min-h-[500px] w-full border rounded-lg overflow-hidden bg-background">
      {coverImage ? (
        <div className="relative w-full h-[300px] bg-muted">
          <img
            src={coverImage.url}
            alt={coverImage.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCoverImageUpload(true)}
            >
              Change Cover
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCoverImageChange?.(null)}
            >
              Remove Cover
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full h-[100px] bg-muted flex items-center justify-center">
          <Button
            variant="secondary"
            onClick={() => setShowCoverImageUpload(true)}
            className="gap-2"
          >
            <ImagePlus className="h-4 w-4" />
            Add Cover Image
          </Button>
        </div>
      )}

      {pasting && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-background rounded-lg shadow-lg px-4 py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Uploading pasted image...</span>
          </div>
        </div>
      )}
      
      {/* Toolbar settings */}
      <div className="absolute top-0 right-0 z-40 p-2 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleToolbarPosition}
          className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
          title={`Switch to ${toolbarPosition === 'top' ? 'side' : 'top'} toolbar`}
        >
          {toolbarPosition === 'top' ? <Layout className="h-4 w-4" /> : <MenuSquare className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleToolbar}
          className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
          title={showToolbar ? "Hide toolbar" : "Show toolbar"}
        >
          {showToolbar ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className={cn("flex", toolbarPosition === 'side' ? 'flex-row' : 'flex-col')}>
        {/* Side toolbar */}
        {showToolbar && toolbarPosition === 'side' && (
          <div className="sticky top-0 left-0 z-30 w-14 bg-background border-r h-[calc(100vh-250px)] flex flex-col items-center py-3 gap-3 overflow-y-auto">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                data-active={editor.isActive('heading', { level: 1 })}
                className="h-10 w-10 p-0 data-[active=true]:bg-muted rounded-full"
                title="Heading 1"
              >
                <Heading1 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                data-active={editor.isActive('heading', { level: 2 })}
                className="h-10 w-10 p-0 data-[active=true]:bg-muted rounded-full"
                title="Heading 2"
              >
                <Heading2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                data-active={editor.isActive('heading', { level: 3 })}
                className="h-10 w-10 p-0 data-[active=true]:bg-muted rounded-full"
                title="Heading 3"
              >
                <Heading3 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setParagraph().run()}
                data-active={editor.isActive('paragraph')}
                className="h-10 w-10 p-0 data-[active=true]:bg-muted rounded-full"
                title="Paragraph"
              >
                <Pilcrow className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="w-8 h-px bg-border/50 my-1" />
            
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                data-active={editor.isActive('bold')}
                className="h-10 w-10 p-0 data-[active=true]:bg-muted rounded-full"
                title="Bold"
              >
                <Bold className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                data-active={editor.isActive('italic')}
                className="h-10 w-10 p-0 data-[active=true]:bg-muted rounded-full"
                title="Italic"
              >
                <Italic className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                data-active={editor.isActive('strike')}
                className="h-10 w-10 p-0 data-[active=true]:bg-muted rounded-full"
                title="Strikethrough"
              >
                <Strikethrough className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="w-8 h-px bg-border/50 my-1" />
            
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                data-active={editor.isActive('bulletList')}
                className="h-10 w-10 p-0 data-[active=true]:bg-muted rounded-full"
                title="Bullet List"
              >
                <List className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                data-active={editor.isActive('orderedList')}
                className="h-10 w-10 p-0 data-[active=true]:bg-muted rounded-full"
                title="Numbered List"
              >
                <ListOrdered className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                data-active={editor.isActive('blockquote')}
                className="h-10 w-10 p-0 data-[active=true]:bg-muted rounded-full"
                title="Quote"
              >
                <Quote className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="w-8 h-px bg-border/50 my-1" />
            
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={setLink}
                data-active={editor.isActive('link')}
                className="h-10 w-10 p-0 data-[active=true]:bg-muted rounded-full"
                title="Add Link"
              >
                <LinkIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageUpload(true)}
                className="h-10 w-10 p-0 data-[active=true]:bg-muted rounded-full"
                title="Add Image"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="w-8 h-px bg-border/50 my-1" />
            
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="h-10 w-10 p-0 rounded-full"
                title="Undo"
              >
                <Undo className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="h-10 w-10 p-0 rounded-full"
                title="Redo"
              >
                <Redo className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex-1">
          {/* Top toolbar */}
          {showToolbar && toolbarPosition === 'top' && (
            <div className="sticky top-0 z-30 bg-background border-b flex justify-center px-4 py-2">
              <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1 px-2 rounded-lg bg-background/90 backdrop-blur-sm supports-[backdrop-filter]:bg-background/70 shadow-sm">
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    data-active={editor.isActive('heading', { level: 1 })}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    data-active={editor.isActive('heading', { level: 2 })}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    data-active={editor.isActive('heading', { level: 3 })}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <Heading3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    data-active={editor.isActive('paragraph')}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <Pilcrow className="h-4 w-4" />
                  </Button>
                </div>

                <div className="w-px h-5 bg-border/50 mx-1" />

                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    data-active={editor.isActive('bold')}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    data-active={editor.isActive('italic')}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    data-active={editor.isActive('strike')}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    data-active={editor.isActive('code')}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </div>

                <div className="w-px h-5 bg-border/50 mx-1" />

                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    data-active={editor.isActive('bulletList')}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    data-active={editor.isActive('orderedList')}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    data-active={editor.isActive('blockquote')}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                </div>

                <div className="w-px h-5 bg-border/50 mx-1" />

                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    data-active={editor.isActive({ textAlign: 'left' })}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    data-active={editor.isActive({ textAlign: 'center' })}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    data-active={editor.isActive({ textAlign: 'right' })}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="w-px h-5 bg-border/50 mx-1" />

                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={setLink}
                    data-active={editor.isActive('link')}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageUpload(true)}
                    className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="w-px h-5 bg-border/50 mx-1" />

                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex items-center gap-1 rounded-lg border bg-background shadow-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                data-active={editor.isActive('bold')}
                className="data-[active=true]:bg-muted"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                data-active={editor.isActive('italic')}
                className="data-[active=true]:bg-muted"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={setLink}
                data-active={editor.isActive('link')}
                className="data-[active=true]:bg-muted"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              {editor.isActive('link') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().unsetLink().run()}
                  className="data-[active=true]:bg-muted"
                >
                  <LinkIcon className="h-4 w-4 line-through" />
                </Button>
              )}
            </div>
          </BubbleMenu>

          <ImageUpload
            open={showImageUpload}
            onOpenChange={setShowImageUpload}
            onImageUploaded={addImage}
          />

          <ImageUpload
            open={showCoverImageUpload}
            onOpenChange={setShowCoverImageUpload}
            onImageUploaded={(imageData) => onCoverImageChange?.(imageData)}
            isCoverImage
          />

          {/* Image Toolbar - Show when an image is selected */}
          {selectedImage && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background/90 backdrop-blur-sm border border-border/40 rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
              <div className="flex items-center gap-1 border-r pr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyImageSize('small')}
                  data-active={imageSize === 'small'}
                  className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  title="Small image"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyImageSize('medium')}
                  data-active={imageSize === 'medium'}
                  className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  title="Medium image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyImageSize('large')}
                  data-active={imageSize === 'large'}
                  className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  title="Large image"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyImageSize('original')}
                  data-active={imageSize === 'original'}
                  className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  title="Original size"
                >
                  <Move className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyImageAlignment('left')}
                  data-active={imageAlignment === 'left'}
                  className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  title="Align left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyImageAlignment('center')}
                  data-active={imageAlignment === 'center'}
                  className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  title="Align center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyImageAlignment('right')}
                  data-active={imageAlignment === 'right'}
                  className="h-8 w-8 p-0 data-[active=true]:bg-muted rounded-full"
                  title="Align right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="p-4 prose prose-sm max-w-none">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
} 