import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import { Trash2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

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
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : comments.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-xl">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-body">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment, i) => (
            <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass-card rounded-xl p-4 hover:glow-border transition-all duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-body font-bold text-primary flex-shrink-0">
                      {comment.author_name[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-body font-semibold text-foreground">{comment.author_name}</span>
                    <span className="text-xs text-muted-foreground font-body">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-body text-foreground/80 leading-relaxed ml-9">{comment.content}</p>
                  {comment.articles && (
                    <p className="text-xs text-muted-foreground font-body mt-1.5 ml-9">
                      On: <span className="font-medium text-foreground/70">{comment.articles.title}</span>
                    </p>
                  )}
                </div>
                <button onClick={() => deleteComment(comment.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-all duration-300 flex-shrink-0" title="Delete comment">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminComments;
