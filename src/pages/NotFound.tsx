import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-muted pb-20 md:pb-0">
      <SiteHeader />
      <main className="paper-frame min-h-[calc(100vh-7rem)] overflow-hidden">
        <section className="not-found-stage">
          <div className="not-found-stage__number" aria-hidden="true">404</div>
          <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center md:py-32">
            <div className="mx-auto mb-8 h-20 w-20 animate-logo-arrival md:h-24 md:w-24">
              <img src="/favicon.png" alt="Juba Chronicle" className="h-full w-full rounded-2xl shadow-xl" />
            </div>
            <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.3em] text-accent">Juba Chronicle archive</p>
            <h1 className="font-display text-4xl font-black uppercase leading-[0.95] md:text-7xl">This story has<br />left the press.</h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              The page may have moved, or the link may no longer be current. Return to today’s edition or search the archive.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-7 font-bold">
                <Link to="/"><ArrowLeft />Today’s edition</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7 font-bold">
                <Link to="/search"><Search />Search archive</Link>
              </Button>
            </div>
          </div>
          <div className="not-found-stage__ticker" aria-hidden="true">
            JUBA • SOUTH SUDAN • THE PULSE OF THE NATION • JUBA • SOUTH SUDAN • THE PULSE OF THE NATION
          </div>
        </section>
      </main>
    </div>
  );
};

export default NotFound;
