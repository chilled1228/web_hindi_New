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
      
      <div className="sticky top-0 z-10 bg-background border-b p-2 flex flex-wrap gap-1">
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            data-active={editor.isActive('heading', { level: 1 })}
            className="data-[active=true]:bg-muted"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            data-active={editor.isActive('heading', { level: 2 })}
            className="data-[active=true]:bg-muted"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            data-active={editor.isActive('heading', { level: 3 })}
            className="data-[active=true]:bg-muted"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setParagraph().run()}
            data-active={editor.isActive('paragraph')}
            className="data-[active=true]:bg-muted"
          >
            <Pilcrow className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
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
            onClick={() => editor.chain().focus().toggleStrike().run()}
            data-active={editor.isActive('strike')}
            className="data-[active=true]:bg-muted"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            data-active={editor.isActive('code')}
            className="data-[active=true]:bg-muted"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            data-active={editor.isActive('bulletList')}
            className="data-[active=true]:bg-muted"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            data-active={editor.isActive('orderedList')}
            className="data-[active=true]:bg-muted"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            data-active={editor.isActive('blockquote')}
            className="data-[active=true]:bg-muted"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            data-active={editor.isActive({ textAlign: 'left' })}
            className="data-[active=true]:bg-muted"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            data-active={editor.isActive({ textAlign: 'center' })}
            className="data-[active=true]:bg-muted"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            data-active={editor.isActive({ textAlign: 'right' })}
            className="data-[active=true]:bg-muted"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={setLink}
            data-active={editor.isActive('link')}
            className="data-[active=true]:bg-muted"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImageUpload(true)}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
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