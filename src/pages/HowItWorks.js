import React from 'react';
import './HowItWorks.css';

function HowItWorks() {
  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-kicker" style={{textAlign: 'center'}}>HOW IT WORKS</div>
          <h1 className="hero-title" style={{textAlign: 'center'}}>How It Works: Expert Support for Your Pilot Training Journey</h1>
          <p className="hero-description">At PilotCenter.net, we provide a seamless, end-to-end pilot training support system designed to help you achieve your dream of becoming a licensed pilot. Our expert team offers personalized pilot consultation and aviation career guidance at every stage of your training journey, ensuring that you receive the best possible support throughout.</p>
        </div>
      </section>

      {/* 2 INDEPENDENT ROWS OF 2 COLUMNS EACH */}
      <section className="two-rows-section">
        {/* FIRST ROW - 2 COLUMNS */}
        <div className="row-container first-row">
          <div className="column-item">
            <img src="/images/7100d5_b4cd8272da6a470cab21fbdedee24d77~mv2.avif" alt="Flight training" className="column-image" loading="lazy" />
          </div>
          <div className="column-item">
            <div className="column-content">
              <h3>Personalized Consultation</h3>
              <p>We begin by understanding your career goals and assessing your current situation. Whether you’re starting from zero or transitioning careers, our expert consultants recommend the ideal path for you—whether it's EASA, FAA, or ICAO certifications—and match you with the best programs suited to your needs and budget.</p>
            </div>
          </div>
        </div>

        {/* SECOND ROW - 2 COLUMNS */}
        <div className="row-container second-row">
          <div className="column-item">
            <div className="column-content">
              <h3>Top Flight School Selection</h3>
              <p>Unlock exclusive discounts on high-quality pilot training with our global network of elite flight schools. We negotiate directly to secure the best rates, saving you time and money. Get detailed insights into each school, including course structures, timelines, and costs, to make an informed decision about your FAA, EASA, or ICAO training.</p>
            </div>
          </div>
          <div className="column-item">
            <img src="/images/7100d5_86109d36311d4c008f79d5eb26c77577~mv2.avif" alt="Pilot career" className="column-image" loading="lazy" />
          </div>
        </div>

        {/* THIRD ROW - 2 COLUMNS */}
        <div className="row-container third-row">
          <div className="column-item">
            <img src="/images/7100d5_3233473fe8b74c278d267f78124834e0~mv2.avif" alt="Built by pilots" className="column-image" loading="lazy" />
          </div>
          <div className="column-item">
            <div className="column-content">
              <h3>Ongoing Monitoring and Support</h3>
              <p>Throughout your training, our team will track your progress and check in regularly to provide advice, motivation, and troubleshooting. We ensure you stay on schedule, meet key milestones, and avoid common challenges that can slow down or derail your training.</p>
            </div>
          </div>
        </div>

        {/* FIFTH ROW - MOBILE: IMAGE ABOVE TEXT */}
        <div className="row-container fifth-row mobile-image-above">
          <div className="column-item mobile-text-column">
            <div className="column-content">
              <h3>Career-Ready Preparation</h3>
              <p>Once your training is complete, we help you take the next big step—getting hired. Our resume building service highlights your unique strengths and qualifications, and our interview preparation boosts your confidence in front of potential employers. From crafting the perfect resume to mock interviews, we make sure you're fully equipped to stand out from the competition and land your first aviation job.</p>
            </div>
          </div>
          <div className="column-item mobile-image-column">
            <img src="/images/18c00e_b7063f58f14d48898414fb2a43892d03~mv2.avif" alt="Pilot training journey" className="column-image" loading="lazy" />
          </div>
        </div>
      </section>

      {/* FULL WIDTH GRAY CONTAINER - JUST ABOVE FOOTER */}
      <div className="full-width-gray-container" style={{padding: '40px 20px', textAlign: 'center'}}>
        <div className="container-content" style={{maxWidth: '1200px', margin: '0 auto'}}>
          <h3 style={{textAlign: 'center'}}>Your Journey, Our Commitment to Your Pilot Career</h3>
          <p style={{textAlign: 'center'}}>When you choose PilotCenter.net, you're not just accessing a service — you're joining a dedicated community of aviation professionals who are here to guide you through every stage of your pilot journey. From understanding flight school cost and choosing the best flight schools, to navigating license requirements and accessing flight school scholarships, we're committed to making sure no aspiring pilot ever feels lost or unsupported.</p>
          <p style={{textAlign: 'center'}}>Our mission is to simplify the path to becoming a pilot — with clear steps, expert advice, and full support. Whether you're exploring how much flight school costs for a private pilot or preparing for your airline career, we're with you — one step, one milestone, one flight at a time.</p>
        </div>
      </div>

    </div>
  );
}

export default HowItWorks;