const SiteLoader = () => (
  <div className="site-loader" role="status" aria-label="Loading Juba Chronicle">
    <div className="site-loader__mark">
      <span className="site-loader__orbit" aria-hidden="true" />
      <img src="/favicon.png" alt="" className="site-loader__icon" />
    </div>
    <p className="site-loader__name">Juba<span>.</span>Chronicle</p>
    <div className="site-loader__rule" aria-hidden="true"><i /></div>
    <span className="site-loader__edition">Loading today’s edition</span>
  </div>
);

export default SiteLoader;