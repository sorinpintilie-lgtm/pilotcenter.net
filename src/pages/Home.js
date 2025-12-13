import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      {/* HERO */}
      <section className="hero" id="about">
        <div className="wrapper">
          <div className="hero-grid">
            <div className="hero-content-wrapper">
              <div className="hero-text-content">
                <div className="hero-kicker">INDEPENDENT PILOT TRAINING GUIDANCE</div>

                <h1 className="hero-title">
                  Your Journey to <span className="highlight">Becoming a Pilot</span> Starts Here!
                </h1>

                <p className="hero-subtitle">
                  We help you navigate flight schools, training routes and pilot career paths with clarity and confidence.
                </p>

                <div className="hero-ctas">
                  <button className="btn btn-blue mobile-only" style={{padding: '12px 24px', fontSize: '14px', minWidth: '200px'}}>Let's talk</button>
                </div>

                <div className="hero-meta">
                  <span><strong>2,000+</strong> flight schools worldwide</span>
                  <span><strong>EASA · FAA · ICAO</strong> training routes</span>
                  <span><strong>Independent</strong> — not sponsored by any school</span>
                </div>
              </div>

              <div className="hero-image-wrapper">
                <div className="hero-visual">
                  <img
                    src="/images/dreamstime_xxl_215257464.avif"
                    alt="Pilot holding airline captain hat"
                    className="hero-image"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 COLUMN SECTION */}
      <section id="features">
        <div className="wrapper">
          <div className="routes-grid">
            <article className="route">
              <h3 className="route-title">01. Personalized School Matching</h3>
              <p className="route-tagline">
                We understand that every aspiring pilot has unique needs and preferences.
              </p>
            </article>

            <article className="route">
              <h3 className="route-title">02. Comprehensive School Database</h3>
              <p className="route-tagline">
                Our extensive database includes detailed profiles of flying schools across the country.
              </p>
            </article>

            <article className="route">
              <h3 className="route-title">03. Guidance and Support</h3>
              <p className="route-tagline">
                From the initial consultation to enrollment, we provide guidance and support.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* BECOME A PILOT + ROUTES */}
      <section id="routes" style={{padding: '32px 0'}}>
        <div className="wrapper">
          <h2 className="section-title">Become a Pilot Now with PilotCenter.net</h2>

          <div>
            <p>Take the leap and soar into the skies! At PilotCenter.net, your dreams of becoming an airline pilot become reality.</p>
            <p>Join us today and elevate your journey to new heights with expert guidance on EASA, FAA, and ICAO training.</p>
            <p>Ready for takeoff?</p>
          </div>

          <div className="routes-grid">
            <article className="route">
              <h3 className="route-title">The EASA Route</h3>
              <p className="route-tagline">
                Ready to conquer the skies? The EASA route offers a structured path to becoming a professional pilot in Europe.
              </p>
              <a href="/easa" className="route-link">Find out how →</a>
            </article>

            <article className="route">
              <h3 className="route-title">The FAA Route</h3>
              <p className="route-tagline">
                Ready to pilot your dreams? The FAA route is your ticket to the skies, offering a comprehensive path to becoming a certified pilot with a U.S. license.
              </p>
              <a href="/faa" className="route-link">Find out how →</a>
            </article>

            <article className="route">
              <h3 className="route-title">The ICAO Route</h3>
              <p className="route-tagline">
                Dreaming of a global flying career? The ICAO route provides a standardized framework recognized worldwide.
              </p>
              <a href="/icao" className="route-link">Find out how →</a>
            </article>
          </div>
        </div>
      </section>

      {/* START + LET US HELP YOU */}
      <section id="start" style={{padding: '16px 0 8px 0'}}>
        <div className="wrapper">
          <h2 className="section-title">Don’t know where to start?</h2>

          <div>
            <p>
              We’ve got you covered! Embarking on a new journey can feel overwhelming, but our extensive aviation resources are here to guide you every step of the way. Whether you're just beginning to explore your passion for becoming a pilot or looking to advance your skills in EASA, FAA, or ICAO training, we offer a wealth of information tailored to your needs.
            </p>
            <p>
              From detailed guides on pilot training programs and licensing requirements to expert tips and industry insights, you'll find everything you need to navigate your path to becoming a professional airline pilot with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* RESOURCES & JOBS */}
      <section id="hub">
        <div className="wrapper">
          <div className="two-cols">
            <div className="block-muted-inner">
              <h3 className="section-title" style={{fontSize: '18px'}}>Let us help you!</h3>
              <p>
                Let PilotCenter.net help you stand out! Our expert resources guide you in creating a compelling pilot CV and preparing for airline interviews, ensuring you make a lasting impression in the aviation industry. Start your journey to success with us today!
              </p>
              <button className="btn btn-blue" onClick={() => window.location.href='/jobs'}>
                Go to Pilot Jobs
              </button>
            </div>

            <div className="block-muted-inner">
              <h3 className="section-title" style={{fontSize: '18px'}}>Our Resources</h3>
              <p>
                At PilotCenter.net, we offer a wealth of aviation resources to support your pilot journey. From comprehensive EASA, FAA, and ICAO guides to expert career advice and training tips, our tools help you succeed in becoming a professional airline pilot.
              </p>
              <button className="btn btn-blue" onClick={() => window.location.href='/news'}>
                Go to News & Resources
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NEW RESPONSIVE FOOTER IMAGE SECTION */}
      <div className="new-footer-image-container">
        <picture className="responsive-footer-picture">
          <source media="(min-width: 769px)" srcSet="/images/11062b_4de68f17bc8f4a54bd634d9d8ff24d16~mv2_d_2952_2025_s_2.avif" />
          <source media="(max-width: 768px)" srcSet="/images/11062b_4de68f17bc8f4a54bd634d9d8ff24d16~mv2_d_2952_2025_s.avif" />
          <img src="/images/11062b_4de68f17bc8f4a54bd634d9d8ff24d16~mv2_d_2952_2025_s.avif" alt="Pilot training" className="new-footer-image" />
        </picture>
      </div>
    </div>
  );
}

export default Home;