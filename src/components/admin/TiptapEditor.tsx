'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function TiptapEditor({ content, onChange, placeholder, className = '' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none',
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
  });

  const handleUpdate = useCallback(() => {
    if (editor) onChange(editor.getHTML());
  }, [editor, onChange]);

  useEffect(() => {
    if (!editor) return;
    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, handleUpdate]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  return (
    <div className={`rounded-lg border border-surface-200 bg-white ${className}`}>
      <EditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function EditorMenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-1 border-b border-surface-200 p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive('bold') ? 'bg-surface-200' : 'hover:bg-surface-100'}`}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive('italic') ? 'bg-surface-200' : 'hover:bg-surface-100'}`}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-surface-200' : 'hover:bg-surface-100'}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-surface-200' : 'hover:bg-surface-100'}`}
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive('bulletList') ? 'bg-surface-200' : 'hover:bg-surface-100'}`}
      >
        List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive('orderedList') ? 'bg-surface-200' : 'hover:bg-surface-100'}`}
      >
        Numbered
      </button>
    </div>
  );
}
