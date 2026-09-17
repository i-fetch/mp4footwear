export function SiteLoader() {
  return (
    <main className="site-loader" aria-label="Loading MP4 Footwear">
      <div className="site-loader__glow" aria-hidden="true" />
      <div className="site-loader__content">
        <div className="site-loader__mark" aria-hidden="true">
          <span>MP</span>
          <span>4</span>
        </div>

        <div className="site-loader__copy">
          <p className="site-loader__eyebrow">MP4 Footwear</p>
          <p className="site-loader__status">Preparing your next pair</p>
        </div>

        <div className="site-loader__progress" aria-hidden="true">
          <span />
        </div>
      </div>

      <p className="site-loader__edition">Est. 2024 <span /> Premium essentials</p>
    </main>
  );
}