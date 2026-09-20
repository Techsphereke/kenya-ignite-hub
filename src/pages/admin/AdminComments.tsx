import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import { Trash2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';

type Comment = Database['public']['Tables']['comments']['Row'];

const AdminComments = () => {
  const [comments, setComments] = useState<(Comment & { articles?: { title: string; slug: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    const { data, error } = await supabase.from('comments').select('*, articles(title, slug)').order('created_at', { ascending: false });
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
      <div className="mb-5"><h1 className="font-newsroom-heading text-2xl font-semibold">Comments</h1><p className="mt-1 text-sm text-newsroom-muted">Review reader discussion across published stories.</p></div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-newsroom-blue border-t-transparent rounded-full animate-spin" /></div>
      ) : comments.length === 0 ? (
        <div className="newsroom-panel text-center py-16">
          <MessageSquare className="w-10 h-10 mx-auto text-newsroom-muted mb-3" />
          <p className="text-newsroom-muted">No comments yet</p>
        </div>
      ) : (
        <div className="newsroom-panel overflow-hidden divide-y divide-newsroom-line">
          {comments.map((comment, i) => (
            <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-newsroom-surface p-4 hover:bg-newsroom-blueSoft transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-sm bg-newsroom-blueSoft flex items-center justify-center text-xs font-bold text-newsroom-blue flex-shrink-0">
                      {comment.author_name[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-newsroom-ink">{comment.author_name}</span>
                    <span className="text-xs text-newsroom-muted">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-newsroom-ink leading-relaxed ml-9">{comment.content}</p>
                  {comment.articles && (
                    <p className="text-xs text-newsroom-muted mt-1.5 ml-9">
                      On: <span className="font-medium text-newsroom-ink">{comment.articles.title}</span>
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteComment(comment.id)}
                  className="h-8 w-8 text-newsroom-danger flex-shrink-0" title="Delete comment">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminComments;
