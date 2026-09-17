import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, Shield, ArrowRight } from 'lucide-react';
import { useCategories } from '@/hooks/use-articles';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SiteHeader = () => {
  const [menuOpen,setMenuOpen]=useState(false); const [searchOpen,setSearchOpen]=useState(false); const [searchQuery,setSearchQuery]=useState('');
  const navigate=useNavigate(); const {user,roles}=useAuth(); const {data:categories}=useCategories();
  const isAdmin=roles.includes('admin')||roles.includes('editor');
  const handleSearch=(e:React.FormEvent)=>{e.preventDefault();if(searchQuery.trim()){navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);setSearchOpen(false);setSearchQuery('')}};
  return <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-foreground">
    <div className="container">
      <div className="hidden md:flex items-center justify-between py-2 border-b border-foreground/15 font-mono text-[10px] uppercase tracking-widest">
        <span>Nairobi, Kenya // {new Date().toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'numeric'})}</span>
        <span className="flex items-center gap-2"><i className="pulse-dot"/>Igniting stories that matter</span>
      </div>
      <div className="flex items-center justify-between py-3 md:py-5">
        <Link to="/" className="group" aria-label="Kenya Ignite home"><span className="block font-display text-2xl sm:text-3xl md:text-5xl uppercase leading-none">Kenya <span className="text-primary">Ignite</span></span><span className="hidden md:block mt-1 font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Independent Kenyan journalism</span></Link>
        <div className="flex items-center gap-1">
          <button onClick={()=>setSearchOpen(v=>!v)} className="p-2.5 border border-transparent hover:border-foreground transition-colors" aria-label="Search"><Search className="w-5 h-5"/></button>
          {isAdmin&&<Link to="/admin" className="hidden md:grid p-2.5 place-items-center border border-transparent hover:border-foreground text-primary" aria-label="Admin"><Shield className="w-5 h-5"/></Link>}
          <Link to={user?'/dashboard':'/auth'} className="hidden md:grid p-2.5 place-items-center border border-transparent hover:border-foreground" aria-label={user?'Dashboard':'Sign in'}><User className="w-5 h-5"/></Link>
          <button onClick={()=>setMenuOpen(v=>!v)} className="p-2.5 border border-foreground md:hidden" aria-label="Menu">{menuOpen?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}</button>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-7 py-2.5 border-t border-foreground/15 overflow-x-auto">
        {(categories||[]).map(c=><Link key={c.id} to={`/category/${c.slug}`} className="font-mono text-[11px] font-bold uppercase whitespace-nowrap animated-underline">{c.name}</Link>)}
      </nav>
    </div>
    <AnimatePresence>{searchOpen&&<motion.form initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} onSubmit={handleSearch} className="overflow-hidden border-t border-foreground"><div className="container py-3 flex gap-2"><input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search the archive" className="flex-1 bg-transparent border-b-2 border-foreground px-2 py-2 font-body focus:outline-none"/><button className="bg-foreground text-background p-3" aria-label="Submit search"><ArrowRight className="w-5 h-5"/></button></div></motion.form>}</AnimatePresence>
    <AnimatePresence>{menuOpen&&<motion.nav initial={{height:0}} animate={{height:'auto'}} exit={{height:0}} className="overflow-hidden border-t border-foreground md:hidden"><div className="container py-4 grid grid-cols-2 gap-px bg-foreground">{(categories||[]).map(c=><Link key={c.id} onClick={()=>setMenuOpen(false)} to={`/category/${c.slug}`} className="bg-background p-4 font-display text-sm uppercase">{c.name}</Link>)}</div></motion.nav>}</AnimatePresence>
  </header>
};
export default SiteHeader;
