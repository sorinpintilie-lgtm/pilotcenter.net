import React from 'react';
import './ProcessSection.css';
import './SharedSection.css';

function ProcessSection() {
  return (
    <section className="process-section">
      <div className="section-container">
        <div className="section-content">
          <h2 className="section-title">A Comprehensive, Expert-Backed Flight School Selection Process</h2>

          <div className="section-image-container">
            <img src="/images/dreamstime_xxl_45826392.avif" alt="Comprehensive flight school selection process" className="section-image" />
          </div>

          <p className="section-text">
            At PilotCenter.net, we go beyond simply listing flight schools — we offer a comprehensive, expert-backed process to help you succeed. Our up-to-date global database includes options for top flight schools, online flight school programs, and even accelerated flight schools tailored to your pace and goals. But the real value lies in how we use this data: through our personalized matching system and experienced pilot consultants, we ensure you're not just picking a school — you're choosing the best flight school for your unique needs and budget.
          </p>

          <p className="section-text">
            From understanding how much flight school costs to preparing for job interviews, crafting your aviation resume, and securing letters of interest, we provide end-to-end pilot training support — all at no extra cost. Whether you’re just starting with your Private Pilot License or preparing for your ATP certification, our goal is to make sure you're confident, prepared, and never alone on your journey to becoming a professional pilot.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ProcessSection;