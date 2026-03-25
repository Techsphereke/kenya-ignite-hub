import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import { Trash2, MessageSquare } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Comment = Database['public']['Tables']['comments']['Row'];

const AdminComments = () => {
  const [comments, setComments] = useState<(Comment & { articles?: { title: string; slug: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, articles(title, slug)')
      .order('created_at', { ascending: false });

    if (error) {
      const { data: fallback } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
      setComments((fallback || []) as any);
    } else {
      setComments(data as any);
    }
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, []);

  const deleteComment = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Comment deleted'); fetchComments(); }
  };

  return (
    <AdminLayout>
      {loading ? (
        <p className="text-sm font-body text-muted-foreground">Loading comments...</p>
      ) : comments.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-body">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-body font-semibold text-foreground">{comment.author_name}</span>
                    <span className="text-xs text-muted-foreground font-body">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-body text-foreground/80 leading-relaxed">{comment.content}</p>
                  {comment.articles && (
                    <p className="text-xs text-muted-foreground font-body mt-1.5">
                      On: <span className="font-medium text-foreground/70">{comment.articles.title}</span>
                    </p>
                  )}
                </div>
                <button onClick={() => deleteComment(comment.id)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors flex-shrink-0" title="Delete comment">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminComments;
