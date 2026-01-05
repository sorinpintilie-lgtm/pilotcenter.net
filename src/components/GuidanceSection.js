import React from 'react';
import './GuidanceSection.css';
import './SharedSection.css';

function GuidanceSection() {
  return (
    <section className="guidance-section">
      <div className="section-container">
        <div className="section-content">
          <h2 className="section-title">Personalized Flight School Guidance and Ongoing Support</h2>

          <div className="section-image-container">
            <img src="/images/dreamstime_37130445_tiff.avif" alt="Personalized flight school guidance" className="section-image" />
          </div>

          <p className="section-text">
            At PilotCenter.net, our approach goes far beyond basic flight school matching. We believe every aspiring pilot deserves personalized guidance from someone who truly understands their aviation goals. That’s why we pair you with a dedicated consultant — an experienced aviation professional who will help you navigate every milestone, from selecting the best flight school to managing flight school costs and exploring flight school scholarships. Your consultant will monitor your progress, keep you motivated, and ensure you stay on track toward your ultimate goal: becoming a licensed pilot through the most effective and affordable path.
          </p>
        </div>
      </div>
    </section>
  );
}

export default GuidanceSection;