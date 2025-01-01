import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-background sticky top-0">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('bold') ? 'bg-accent' : ''}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('italic') ? 'bg-accent' : ''}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('bulletList') ? 'bg-accent' : ''}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('orderedList') ? 'bg-accent' : ''}`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('blockquote') ? 'bg-accent' : ''}`}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          const url = window.prompt('Enter the URL:')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('link') ? 'bg-accent' : ''}`}
        title="Add Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          const url = window.prompt('Enter the image URL:')
          if (url) {
            editor.chain().focus().setImage({ src: url }).run()
          }
        }}
        className="p-2 rounded hover:bg-accent"
        title="Add Image"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="border rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none"
      />
    </div>
  )
} 