import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const btnClass = (isActive) => 
    `p-2 rounded hover:bg-gray-700 transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400'}`;

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}>
            <strong>B</strong>
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}>
            <em>I</em>
        </button>
        <div className="w-px h-6 bg-gray-700 mx-2 self-center" />
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}>
            Bullet List
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}>
            Ordered List
        </button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive('codeBlock'))}>
            Code Block
        </button>
    </div>
  );
};

const normalizeContent = (data) => {
  if (!data || Object.keys(data).length === 0) return { type: 'doc', content: [{ type: 'paragraph' }] };
  if (typeof data === 'string') {
     try { return normalizeContent(JSON.parse(data)); } 
     catch (e) { return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: data }] }] }; }
  }
  if (data.type !== 'doc') {
      if (data.type) return { type: 'doc', content: [data] };
      return { type: 'doc', content: [{ type: 'paragraph' }] };
  }
  return data;
};

const DiscussionEditor = ({ content, onChange, isReadOnly = false }) => {
  const isRemoteUpdate = React.useRef(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: normalizeContent(content),
    editable: !isReadOnly,
    editorProps: {
        attributes: {
            class: 'prose prose-invert max-w-none focus:outline-none p-4 min-h-[500px]'
        }
    },
    onUpdate: ({ editor, transaction }) => {
      // Guard: Ignore if this update was triggered by our own setContent call
      if (isRemoteUpdate.current) return;
      
      // Guard: Only emit if the document actually changed
      if (!transaction.docChanged) return;
      
      onChange(editor.getJSON());
    },
  });

  // Sync content from outside (socket)
  useEffect(() => {
    if (editor && content) {
      const normalizedIncoming = normalizeContent(content);
      const current = JSON.stringify(editor.getJSON());
      const incoming = JSON.stringify(normalizedIncoming);
      if (current !== incoming) {
          // Lock: Mark this update as remote
          isRemoteUpdate.current = true;
          
          // Execute sync update
          editor.commands.setContent(normalizedIncoming);
          
          // Unlock immediately (ProseMirror transactions are synchronous)
          isRemoteUpdate.current = false;
      }
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default DiscussionEditor;
