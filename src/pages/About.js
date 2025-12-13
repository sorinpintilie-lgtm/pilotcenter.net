import React from 'react';
import './About.css';
import Hero from '../components/Hero';

function About() {
  return (
    <div className="about-page">
      {/* NEW INDEPENDENT HERO COMPONENT */}
      <Hero />

      {/* 2 INDEPENDENT ROWS OF 2 COLUMNS EACH */}
      <section className="two-rows-section">
        {/* FIRST ROW - 2 COLUMNS */}
        <div className="row-container first-row">
          <div className="column-item">
            <img src="/images/dreamstime_37130445_tiff.avif" alt="Flight training" className="column-image" loading="lazy" />
          </div>
          <div className="column-item">
            <div className="column-content">
              <h3>Personalized Flight School Guidance and Ongoing Support</h3>
              <p>At PilotCenter.net, our approach goes far beyond basic flight school matching. We believe every aspiring pilot deserves personalized guidance from someone who truly understands their aviation goals. That's why we pair you with a dedicated consultant — an experienced aviation professional who will help you navigate every milestone, from selecting the best flight school to managing flight school costs and exploring flight school scholarships. Your consultant will monitor your progress, keep you motivated, and ensure you stay on track toward your ultimate goal: becoming a licensed pilot through the most effective and affordable path.</p>
            </div>
          </div>
        </div>

        {/* SECOND ROW - 2 COLUMNS */}
        <div className="row-container second-row">
          <div className="column-item">
            <div className="column-content">
              <h3>A Comprehensive, Expert-Backed Flight School Selection Process</h3>
              <p>At PilotCenter.net, we go beyond simply listing flight schools — we offer a comprehensive, expert-backed process to help you succeed. Our up-to-date global database includes options for top flight schools, online flight school programs, and even accelerated flight schools tailored to your pace and goals. But the real value lies in how we use this data: through our personalized matching system and experienced pilot consultants, we ensure you're not just picking a school — you're choosing the best flight school for your unique needs and budget.</p>
              <p>From understanding how much flight school costs to preparing for job interviews, crafting your aviation resume, and securing letters of interest, we provide end-to-end pilot training support — all at no extra cost. Whether you're just starting with your Private Pilot License or preparing for your ATP certification, our goal is to make sure you're confident, prepared, and never alone on your journey to becoming a professional pilot.</p>
            </div>
          </div>
          <div className="column-item">
            <img src="/images/dreamstime_xxl_45826392.avif" alt="Pilot career" className="column-image" loading="lazy" />
          </div>
        </div>

        {/* THIRD ROW - 2 COLUMNS */}
        <div className="row-container third-row">
          <div className="column-item">
            <img src="/images/dreamstime_xl_37135215.avif" alt="Built by pilots" className="column-image" loading="lazy" />
          </div>
          <div className="column-item">
            <div className="column-content">
              <h3>Built by Pilots, for Future Pilots</h3>
              <p>At PilotCenter.net, we're not just advisors — we're professional pilots who've walked the same path. We've experienced the long training hours, the uncertainty of choosing the right flight school, and the burden of understanding how much flight school costs. That's exactly why we created the kind of support system we wish we had.</p>
              <p>From negotiating with top flight schools for better tuition rates to helping you access flight school scholarships and discounts on essential pilot gear, we're committed to reducing the average cost of flight school and making your training journey more affordable. With us, you're not just enrolling in a program — you're gaining a partner who understands your goals and is invested in your success.</p>
            </div>
          </div>
        </div>

        {/* FOURTH ROW - SINGLE COLUMN TEXT */}
        <div className="row-container fourth-row">
          <div className="single-column-item">
            <div className="column-content">
              <h3>Your Journey, Our Commitment to Your Pilot Career</h3>
              <p>When you choose PilotCenter.net, you're not just accessing a service — you're joining a dedicated community of aviation professionals who are here to guide you through every stage of your pilot journey. From understanding flight school cost and choosing the best flight schools, to navigating license requirements and accessing flight school scholarships, we're committed to making sure no aspiring pilot ever feels lost or unsupported.</p>
              <p>Our mission is to simplify the path to becoming a pilot — with clear steps, expert advice, and full support. Whether you're exploring how much flight school costs for a private pilot or preparing for your airline career, we're with you — one step, one milestone, one flight at a time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ENHANCED RESPONSIVE FOOTER IMAGE SECTION - REMADE */}
      <div className="enhanced-footer-image-container">
        <div className="footer-overlay">
          <h2 className="footer-title">Start Your Journey to the Skies</h2>
          <p className="footer-subtitle">Discover the world of aviation and begin your pilot training today</p>
        </div>
        <picture className="enhanced-responsive-footer-picture">
          <source media="(min-width: 1024px)" srcSet="/images/11062b_4de68f17bc8f4a54bd634d9d8ff24d16~mv2_d_2952_2025_s_2.avif" />
          <source media="(min-width: 769px)" srcSet="/images/11062b_4de68f17bc8f4a54bd634d9d8ff24d16~mv2_d_2952_2025_s.avif" />
          <source media="(max-width: 768px)" srcSet="/images/11062b_4de68f17bc8f4a54bd634d9d8ff24d16~mv2_d_2952_2025_s.avif" />
          <img src="/images/11062b_4de68f17bc8f4a54bd634d9d8ff24d16~mv2_d_2952_2025_s.avif" alt="Pilot training - Start your aviation journey" className="enhanced-footer-image" loading="lazy" />
        </picture>
      </div>
    </div>
  );
}

export default About;