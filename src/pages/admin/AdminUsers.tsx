import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import { Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';

type Profile = Database['public']['Tables']['profiles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRoles extends Profile {
  roles: AppRole[];
}

const roleColors: Record<AppRole, string> = {
  admin: 'bg-newsroom-blueSoft text-newsroom-blue',
  editor: 'bg-newsroom-canvas text-newsroom-success',
  author: 'bg-newsroom-canvas text-newsroom-muted',
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
      <div className="mb-5"><h1 className="font-newsroom-heading text-2xl font-semibold">Users</h1><p className="mt-1 text-sm text-newsroom-muted">Manage newsroom access and publishing roles.</p></div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-newsroom-blue border-t-transparent rounded-full animate-spin" /></div>
      ) : users.length === 0 ? (
        <div className="newsroom-panel text-center py-16">
          <UsersIcon className="w-10 h-10 mx-auto text-newsroom-muted mb-3" />
          <p className="text-newsroom-muted">No users found</p>
        </div>
      ) : (
        <div className="newsroom-panel overflow-hidden divide-y divide-newsroom-line">
          {users.map((user, i) => (
            <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-newsroom-surface p-4 flex flex-col items-start gap-4 hover:bg-newsroom-blueSoft transition-colors sm:flex-row sm:items-center">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-sm object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-sm bg-newsroom-blueSoft flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-newsroom-blue">{(user.display_name || '?')[0].toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-newsroom-ink">{user.display_name || 'Unnamed'}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {user.roles.map(role => (
                    <span key={role} className={`px-2 py-0.5 rounded-sm text-xs font-medium ${roleColors[role]}`}>
                      {role}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-newsroom-muted">Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                {(['admin', 'editor', 'author'] as AppRole[]).map(role => {
                  const has = user.roles.includes(role);
                  return (
                    <Button key={role} variant="outline" size="sm" onClick={() => toggleRole(user.user_id, role, has)}
                      title={`${has ? 'Remove' : 'Add'} ${role} role`}
                      className={`px-2.5 py-1 rounded-sm border border-newsroom-line text-xs font-medium transition-colors ${
                        has ? roleColors[role] : 'bg-newsroom-surface text-newsroom-muted hover:bg-newsroom-canvas'
                      }`}>
                      {role}
                    </Button>
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
