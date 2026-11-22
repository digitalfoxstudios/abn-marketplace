const verticals = [
  {
    number: "01",
    name: "ABN Store",
    tag: "SHOP EVERYDAY",
    description: "Discover useful products across everyday shopping categories, brought together in one convenient place.",
    id: "store",
    symbol: "▣",
  },
  {
    number: "02",
    name: "ABN Business",
    tag: "CONNECT & GROW",
    description: "Find local businesses, explore services and build connections between customers, sellers and enterprises.",
    id: "business",
    symbol: "⌂",
  },
  {
    number: "03",
    name: "ABN Daily Needs",
    tag: "FRESH & ESSENTIALS",
    description: "Shop groceries, fruits, vegetables, dairy and household essentials from one ABN-managed store.",
    id: "daily-needs",
    symbol: "✿",
  },
];

export default function Home() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#" aria-label="ABN Marketplace home">
          <span className="brand-mark">ABN</span>
          <span className="brand-copy"><strong>ABN Marketplace</strong><small>One network. Many possibilities.</small></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#store">Store</a>
          <a href="#business">Business</a>
          <a href="#daily-needs">Daily Needs</a>
        </nav>
        <a className="header-cta" href="/account">Sign in / Join <span aria-hidden="true">↗</span></a>
      </header>

      <main>
        <section className="hero" id="explore">
          <div className="hero-content">
            <span className="eyebrow"><span className="eyebrow-dot" /> A marketplace built around community</span>
            <h1>Everything you need.<br /><span>All in one network.</span></h1>
            <p className="hero-description">
              Shop products, discover businesses and get everyday essentials through one connected marketplace.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#verticals">Explore the marketplace <span aria-hidden="true">→</span></a>
              <a className="button button-secondary" href="#about">Get to know ABN</a>
            </div>
            <div className="hero-note"><span aria-hidden="true">✓</span> Cash on Delivery planned for launch</div>
          </div>
          <div className="hero-art" aria-label="Illustration representing shopping, business and daily essentials">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="art-card art-card-main"><span className="art-symbol">✳</span><strong>One marketplace</strong><small>Three connected experiences</small></div>
            <div className="art-card art-card-store"><span>▣</span><strong>Store</strong></div>
            <div className="art-card art-card-business"><span>⌂</span><strong>Business</strong></div>
            <div className="art-card art-card-daily"><span>✿</span><strong>Daily Needs</strong></div>
            <span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✧</span>
          </div>
        </section>

        <section className="trust-strip" aria-label="Marketplace highlights">
          <div><strong>One account</strong><span>Connected experiences</span></div>
          <div><strong>Community first</strong><span>Local discovery and commerce</span></div>
          <div><strong>COD at launch</strong><span>Simple payment experience</span></div>
        </section>

        <section className="verticals-section section-wrap" id="verticals">
          <div className="section-heading">
            <div><span className="eyebrow">THE ABN ECOSYSTEM</span><h2>One marketplace.<br /><span>Three ways to connect.</span></h2></div>
            <p>From shopping to business discovery to your daily grocery list, ABN brings essential experiences together.</p>
          </div>
          <div className="vertical-grid">
            {verticals.map((item) => (
              <article className={`vertical-card ${item.id}`} key={item.number} id={item.id}>
                <div className="card-top"><span className="card-number">{item.number}</span><span className="card-icon" aria-hidden="true">{item.symbol}</span></div>
                <span className="card-tag">{item.tag}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <a href="#about" className="card-link">Discover more <span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="daily-banner">
          <div className="daily-banner-inner">
            <div><span className="eyebrow eyebrow-light">ABN DAILY NEEDS</span><h2>Your everyday essentials,<br />closer to home.</h2><p>ABN-managed stock, warehouse operations and delivery planning. Quick delivery is a target where service availability and distance allow.</p></div>
            <div className="daily-badge"><span aria-hidden="true">✿</span><strong>Fresh choices</strong><small>Groceries • Produce • Home</small></div>
          </div>
        </section>

        <section className="about-section section-wrap" id="about">
          <span className="eyebrow">BUILT TO CONNECT</span>
          <h2>Commerce that creates<br /><span>more opportunities.</span></h2>
          <p>ABN Marketplace is an initiative of Bahujan Samaj Vikas Sansthan (BSVS), designed to connect customers, local businesses and suppliers through a unified digital platform.</p>
          <div className="about-points"><span>A unified marketplace</span><span>Local-first beginnings in Mau, Uttar Pradesh</span><span>Designed to expand across India</span></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <a className="brand brand-footer" href="#"><span className="brand-mark">ABN</span><span className="brand-copy"><strong>ABN Marketplace</strong><small>One network. Many possibilities.</small></span></a>
          <p>Bringing shopping, businesses and daily needs together.</p>
          <div className="footer-app"><span>ABN Android App</span><strong>Coming soon</strong></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} ABN Marketplace. All rights reserved.</span><span>An initiative of BSVS</span></div>
      </footer>
    </>
  );
}
