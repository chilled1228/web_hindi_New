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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect } from 'react';
import { ImageUpload } from './editor/image-upload';
import { generateStoragePath, uploadImage } from '@/lib/storage-utils';
import { Editor as TipTapEditor } from '@tiptap/react';

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
}

interface ImageData {
  url: string;
  alt: string;
  title: string;
  description: string;
}

export default function Editor({ value, onChange }: EditorProps) {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [editorInstance, setEditorInstance] = useState<TipTapEditor | null>(null);

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
      };
      
      editorInstance?.chain().focus().setImage({
        src: imageData.url,
        alt: imageData.alt,
        title: imageData.title,
      }).run();
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

  const addImage = (imageData: ImageData) => {
    editor.chain().focus().setImage({
      src: imageData.url,
      alt: imageData.alt,
      title: imageData.title,
    }).run();

    if (imageData.description) {
      editor.chain()
        .focus()
        .insertContent('<figcaption class="text-center text-sm text-muted-foreground mt-2">' + imageData.description + '</figcaption>')
        .run();
    }
  };

  return (
    <div className="relative min-h-[500px] w-full border rounded-lg overflow-hidden bg-background">
      {pasting && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-background rounded-lg shadow-lg px-4 py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Uploading pasted image...</span>
          </div>
        </div>
      )}
      
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-background/90 backdrop-blur-sm supports-[backdrop-filter]:bg-background/70 border border-border/40 rounded-full shadow-lg px-3 py-1.5 flex flex-wrap gap-0.5 max-w-[calc(100%-1rem)] w-fit">
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            data-active={editor.isActive('heading', { level: 1 })}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            data-active={editor.isActive('heading', { level: 2 })}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            data-active={editor.isActive('heading', { level: 3 })}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setParagraph().run()}
            data-active={editor.isActive('paragraph')}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <Pilcrow className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="w-px h-5 bg-border/50 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-active={editor.isActive('bold')}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-active={editor.isActive('italic')}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            data-active={editor.isActive('strike')}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            data-active={editor.isActive('code')}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <Code className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="w-px h-5 bg-border/50 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            data-active={editor.isActive('bulletList')}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            data-active={editor.isActive('orderedList')}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            data-active={editor.isActive('blockquote')}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="w-px h-5 bg-border/50 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            data-active={editor.isActive({ textAlign: 'left' })}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            data-active={editor.isActive({ textAlign: 'center' })}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            data-active={editor.isActive({ textAlign: 'right' })}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="w-px h-5 bg-border/50 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={setLink}
            data-active={editor.isActive('link')}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>
          {editor.isActive('link') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="h-7 w-7 p-0 rounded-full"
            >
              <LinkIcon className="h-3.5 w-3.5 line-through" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImageUpload(true)}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>
          {editor.isActive('image') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteSelection().run()}
              className="h-7 w-7 p-0 rounded-full"
            >
              <ImageIcon className="h-3.5 w-3.5 line-through" />
            </Button>
          )}
        </div>

        <div className="w-px h-5 bg-border/50 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <Undo className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-7 w-7 p-0 data-[active=true]:bg-muted rounded-full"
          >
            <Redo className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex items-center gap-1 rounded-lg border bg-background shadow-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImageUpload(true)}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>
      </FloatingMenu>

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

      <div className="p-4 prose prose-sm max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
} 