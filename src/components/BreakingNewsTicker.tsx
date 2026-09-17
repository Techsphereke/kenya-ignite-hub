import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useBreakingArticles } from '@/hooks/use-articles';
const BreakingNewsTicker=()=>{const {data:breaking}=useBreakingArticles();if(!breaking?.length)return null;const items=[...breaking,...breaking];return <div className="bg-foreground text-background border-b-4 border-primary overflow-hidden"><div className="flex items-stretch"><div className="relative z-10 flex items-center gap-2 bg-primary px-4 md:px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest"><Zap className="w-3.5 h-3.5"/>Breaking</div><div className="overflow-hidden flex-1"><div className="ticker-scroll flex items-center gap-12 whitespace-nowrap py-2.5 px-6">{items.map((a,i)=><Link key={`${a.id}-${i}`} to={`/article/${a.slug}`} className="font-body text-sm hover:text-accent transition-colors">{a.title}<span className="ml-12 text-primary">//</span></Link>)}</div></div></div></div>};
export default BreakingNewsTicker;
