import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading2, List, ListOrdered, LinkIcon, ImageIcon, Undo, Redo } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const { user } = useAuth();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      LinkExt.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your article...' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !user) return;
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('media').upload(path, file);
      if (error) return;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      editor.chain().focus().setImage({ src: publicUrl }).run();
    };
    input.click();
  };

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}><Bold className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}><Italic className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}><Heading2 className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}><List className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}><ListOrdered className="w-4 h-4" /></button>
        <button type="button" onClick={addLink} className={btnClass(editor.isActive('link'))}><LinkIcon className="w-4 h-4" /></button>
        <button type="button" onClick={addImage} className={btnClass(false)}><ImageIcon className="w-4 h-4" /></button>
        <div className="flex-1" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}><Undo className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)}><Redo className="w-4 h-4" /></button>
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[300px] font-body text-foreground focus:outline-none
        [&_.tiptap]:outline-none [&_.tiptap]:min-h-[280px]
        [&_.tiptap_p]:mb-3 [&_.tiptap_h2]:font-display [&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:mt-6 [&_.tiptap_h2]:mb-2
        [&_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.is-editor-empty]:before:text-muted-foreground [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:pointer-events-none
      " />
    </div>
  );
};

export default RichTextEditor;
