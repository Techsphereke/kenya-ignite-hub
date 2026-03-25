import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import { Shield, UserX, Users as UsersIcon } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRoles extends Profile {
  roles: AppRole[];
}

const roleColors: Record<AppRole, string> = {
  admin: 'bg-primary text-primary-foreground',
  editor: 'bg-secondary text-secondary-foreground',
  author: 'bg-muted text-muted-foreground',
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
        <p className="text-sm font-body text-muted-foreground">Loading users...</p>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <UsersIcon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-body">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-body font-bold text-muted-foreground">{(user.display_name || '?')[0].toUpperCase()}</span>
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

              {/* Role toggles */}
              <div className="flex gap-1 flex-shrink-0">
                {(['admin', 'editor', 'author'] as AppRole[]).map(role => {
                  const has = user.roles.includes(role);
                  return (
                    <button key={role} onClick={() => toggleRole(user.user_id, role, has)}
                      title={`${has ? 'Remove' : 'Add'} ${role} role`}
                      className={`px-2.5 py-1 rounded-md text-xs font-body font-medium transition-colors ${has ? roleColors[role] : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
