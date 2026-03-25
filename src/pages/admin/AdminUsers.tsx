import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import { Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRoles extends Profile {
  roles: AppRole[];
}

const roleColors: Record<AppRole, string> = {
  admin: 'bg-primary/20 text-primary shadow-[0_0_8px_hsl(var(--primary)/0.15)]',
  editor: 'bg-secondary/20 text-secondary shadow-[0_0_8px_hsl(var(--secondary)/0.15)]',
  author: 'bg-muted/50 text-muted-foreground',
};

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: allRoles } = await supabase.from('user_roles').select('*');
    const usersWithRoles: UserWithRoles[] = (profiles || []).map(p => ({
      ...p,
      roles: (allRoles || []).filter(r => r.user_id === p.user_id).map(r => r.role),
    }));
    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (userId: string, role: AppRole, hasRole: boolean) => {
    if (hasRole) {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role);
      if (error) toast.error(error.message);
      else { toast.success(`Removed ${role} role`); fetchUsers(); }
    } else {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });
      if (error) toast.error(error.message);
      else { toast.success(`Added ${role} role`); fetchUsers(); }
    }
  };

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-xl">
          <UsersIcon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-body">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, i) => (
            <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4 flex items-center gap-4 hover:glow-border transition-all duration-300">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-border/30" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-body font-bold text-foreground">{(user.display_name || '?')[0].toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-body font-semibold text-foreground">{user.display_name || 'Unnamed'}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {user.roles.map(role => (
                    <span key={role} className={`px-2 py-0.5 rounded-full text-xs font-body font-medium ${roleColors[role]}`}>
                      {role}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-body">Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                {(['admin', 'editor', 'author'] as AppRole[]).map(role => {
                  const has = user.roles.includes(role);
                  return (
                    <button key={role} onClick={() => toggleRole(user.user_id, role, has)}
                      title={`${has ? 'Remove' : 'Add'} ${role} role`}
                      className={`px-2.5 py-1 rounded-lg text-xs font-body font-medium transition-all duration-300 ${
                        has ? roleColors[role] : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                      }`}>
                      {role}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
