const RotatingBadge = ({ className = '' }: { className?: string }) => (
  <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
    <svg viewBox="0 0 100 100" className="h-full w-full badge-spin fill-current">
      <path id="jc-badge-path" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
      <text fontSize="8" fontWeight="900" letterSpacing="2.4">
        <textPath href="#jc-badge-path">• JUBA CHRONICLE • TRUTH FIRST • INDEPENDENT •</textPath>
      </text>
    </svg>
  </div>
);
export default RotatingBadge;
