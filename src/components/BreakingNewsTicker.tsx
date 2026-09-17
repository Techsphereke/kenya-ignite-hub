import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useBreakingArticles } from '@/hooks/use-articles';
const BreakingNewsTicker=()=>{const {data:breaking}=useBreakingArticles();if(!breaking?.length)return null;const items=[...breaking,...breaking];return <div className="bg-primary text-primary-foreground overflow-hidden"><div className="flex items-stretch"><div className="relative z-10 flex items-center gap-2 bg-destructive text-destructive-foreground px-4 md:px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.2em]"><Zap className="w-3.5 h-3.5"/>Breaking</div><div className="overflow-hidden flex-1"><div className="ticker-scroll flex items-center gap-12 whitespace-nowrap py-2.5 px-6">{items.map((a,i)=><Link key={`${a.id}-${i}`} to={`/article/${a.slug}`} className="text-sm font-medium hover:text-accent transition-colors">{a.title}<span className="ml-12 text-accent">//</span></Link>)}</div></div></div></div>};
export default BreakingNewsTicker;
