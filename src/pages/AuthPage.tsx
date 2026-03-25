import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Flame, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      else { toast.success('Signed in successfully!'); navigate('/dashboard'); }
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: displayName }, emailRedirectTo: window.location.origin },
      });
      if (error) toast.error(error.message);
      else toast.success('Account created! Check your email to confirm.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background animated-bg noise-overlay">
      <SiteHeader />
      <div className="container max-w-md py-16 relative z-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground font-body hover:text-primary transition-colors duration-300 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-6 md:p-8 glow-border">
          <div className="flex items-center gap-2 justify-center mb-6">
            <Flame className="w-6 h-6 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
            <span className="text-lg font-display font-bold text-foreground">Kenya <span className="gradient-text">Ignite</span></span>
          </div>

          <h2 className="text-xl font-display font-bold text-foreground text-center mb-1">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm font-body text-muted-foreground text-center mb-6">
            {isLogin ? 'Sign in to your author dashboard' : 'Join as a contributor'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="text-sm font-body font-medium text-foreground block mb-1">Display Name</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                  required={!isLogin} placeholder="Your name"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </motion.div>
            )}
            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>
            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••" minLength={6}
                className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-body font-medium text-sm hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] transition-all duration-300 disabled:opacity-50">
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm font-body text-muted-foreground text-center mt-4">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline transition-all">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default AuthPage;
