import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading2, List, ListOrdered, LinkIcon, ImageIcon, Undo, Redo } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

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

  const tool = (label: string, action: () => void, icon: ReactNode, active = false) => (
    <Button type="button" variant={active ? 'default' : 'ghost'} size="icon" onClick={action} className="h-8 w-8" title={label} aria-label={label}>{icon}</Button>
  );

  return (
    <div className="overflow-hidden border border-newsroom-line bg-newsroom-surface" style={{ borderRadius: 3 }}>
      <div className="flex flex-wrap gap-1 border-b border-newsroom-line bg-newsroom-canvas p-2">
        {tool('Bold', () => editor.chain().focus().toggleBold().run(), <Bold />, editor.isActive('bold'))}
        {tool('Italic', () => editor.chain().focus().toggleItalic().run(), <Italic />, editor.isActive('italic'))}
        {tool('Heading', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 />, editor.isActive('heading', { level: 2 }))}
        {tool('Bullet list', () => editor.chain().focus().toggleBulletList().run(), <List />, editor.isActive('bulletList'))}
        {tool('Numbered list', () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered />, editor.isActive('orderedList'))}
        {tool('Add link', addLink, <LinkIcon />, editor.isActive('link'))}
        {tool('Add image', addImage, <ImageIcon />)}
        <div className="flex-1" />
        {tool('Undo', () => editor.chain().focus().undo().run(), <Undo />)}
        {tool('Redo', () => editor.chain().focus().redo().run(), <Redo />)}
      </div>
      <EditorContent editor={editor} className="prose max-w-none min-h-[460px] p-6 text-newsroom-ink focus:outline-none
        [&_.tiptap]:outline-none [&_.tiptap]:min-h-[420px]
        [&_.tiptap_p]:mb-3 [&_.tiptap_h2]:font-display [&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:mt-6 [&_.tiptap_h2]:mb-2
        [&_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.is-editor-empty]:before:text-muted-foreground [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:pointer-events-none
      " />
    </div>
  );
};

export default RichTextEditor;
