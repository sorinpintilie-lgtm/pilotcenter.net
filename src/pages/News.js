import React from 'react';

function News() {
  return (
    <div className="page-content">
      <section className="hero">
        <div className="wrapper">
          <div className="hero-grid">
            <div className="hero-content-wrapper">
              <div className="hero-text-content">
                <div className="hero-kicker">NEWS & RESOURCES</div>
                <h1 className="hero-title">Aviation News & Resources</h1>
                <p className="hero-subtitle">Stay updated with the latest aviation news and access valuable resources.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{padding: '30px 0'}}>
        <div className="wrapper">
          <div className="block-muted-inner">
            <h2 className="section-title">News & Resources</h2>
            <p>This page provides the latest aviation news, articles, and resources to help you in your pilot journey.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default News;