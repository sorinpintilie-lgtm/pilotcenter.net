import React, { useEffect } from 'react';
import './Costs.css';

function Costs() {
  useEffect(() => {
    // Add click event listeners to the option columns
    const columns = document.querySelectorAll('.costs-option-column');
    const contentTexts = document.querySelectorAll('.costs-content-text');

    const handleColumnClick = (column) => {
      // Remove active class from all columns and content
      columns.forEach(col => col.classList.remove('active'));
      contentTexts.forEach(content => content.classList.remove('active'));

      // Add active class to clicked column
      column.classList.add('active');

      // Show corresponding content
      const contentId = column.getAttribute('data-content') + '-content';
      const contentToShow = document.getElementById(contentId);
      if (contentToShow) {
        contentToShow.classList.add('active');
      }
    };

    // Add event listeners
    columns.forEach(column => {
      column.addEventListener('click', () => handleColumnClick(column));
    });

    // Cleanup function
    return () => {
      columns.forEach(column => {
        column.removeEventListener('click', () => handleColumnClick(column));
      });
    };
  }, []);
  return (
    <div className="costs-page">
      <section className="new-hero">
        <div className="new-hero-container">
          <div className="new-hero-content">
            <div className="new-hero-kicker">FLIGHT SCHOOL COSTS</div>

            <h1 className="new-hero-title">
              Cost Breakdown and Negotiation
            </h1>

            <h2 className="new-hero-subtitle">Detailed Cost Breakdown</h2>

            <p className="new-hero-additional">
              Understanding the financial commitment of becoming a pilot is crucial, which is why we provide a transparent breakdown of costs across different certification routes.
            </p>
          </div>

          <div className="new-hero-image-container">
            <img src="/images/dreamstime_xxl_157001658_edited.avif" alt="Flight school costs" className="new-hero-image" />
            <div className="new-hero-image-overlay"></div>
          </div>
        </div>
      </section>

      {/* 3-Column Interactive Section */}
      <section className="costs-options">
        <h2 className="costs-options-title">Here's what you can typically expect:</h2>
        <div className="costs-options-container">
          <div className="costs-option-column active" data-content="easa">
            <h3 className="costs-option-title">EASA Cost Breakdown</h3>
          </div>

          <div className="costs-option-column" data-content="faa">
            <h3 className="costs-option-title">FAA Cost Breakdown</h3>
          </div>

          <div className="costs-option-column" data-content="icao">
            <h3 className="costs-option-title">ICAO Cost Breakdown</h3>
          </div>
        </div>

        <div className="costs-content-display">
          <div className="costs-content-text active" id="easa-content">
            <h3>EASA Route (Europe)</h3>
            <p><strong>Private Pilot License (PPL):</strong> €10,000 - €15,000</p>
            <p><strong>Commercial Pilot License (CPL):</strong> €30,000 - €45,000</p>
            <p><strong>Airline Transport Pilot License (ATPL):</strong> €70,000 - €100,000</p>
            <p>This route generally has higher costs due to stringent requirements and specific certifications. However, completing EASA training can open doors to flying with European and other international airlines.</p>
          </div>

          <div className="costs-content-text" id="faa-content">
            <h3>FAA Route (United States)</h3>
            <p><strong>Private Pilot License (PPL):</strong> $8,000 - $12,000</p>
            <p><strong>Commercial Pilot License (CPL):</strong> $20,000 - $35,000</p>
            <p><strong>Airline Transport Pilot License (ATP):</strong> $60,000 - $80,000</p>
            <p>The FAA path tends to be more affordable compared to the EASA route and is widely recognized by airlines based in the U.S. and other ICAO-member countries.</p>
          </div>

          <div className="costs-content-text" id="icao-content">
            <h3>ICAO Route (Rest of the World)</h3>
            <p><strong>Private Pilot License (PPL):</strong> $10,000 - $18,000 (depending on the region)</p>
            <p><strong>Commercial Pilot License (CPL):</strong> $25,000 - $40,000</p>
            <p><strong>Airline Transport Pilot License (ATPL):</strong> $60,000 - $90,000</p>
            <p>ICAO offers a flexible path for those looking to work with international airlines or in countries outside Europe and the U.S. The costs can vary significantly depending on the country and training institution.</p>
          </div>
        </div>

        {/* Additional Costs Section */}
        <div className="costs-content-display">
          <div className="costs-content-text" style={{backgroundColor: '#f8f9fa', padding: '24px', borderRadius: '8px', maxWidth: '800px', margin: '20px auto', display: 'block'}}>
            <h3>Additional Costs to Consider (varies by school and country)</h3>
            <p><strong>Ground School Fees:</strong> €1,000 - €5,000 / $1,000 - $4,000 (varies by school)</p>
            <p><strong>Examination Fees:</strong> €500 - €2,000 / $500 - $1,500</p>
            <p><strong>Medical Certification:</strong> €200 - €800 / $150 - $600</p>
            <p><strong>Accommodation and Living Expenses:</strong> Depending on the location, living costs can significantly impact the overall budget.</p>
          </div>
        </div>

        {/* Blue Separation Bar */}
        <div style={{height: '4px', background: 'linear-gradient(90deg, #2563eb, #38bdf8)', maxWidth: 'var(--wrapper-width)', margin: '30px auto', borderRadius: '2px'}}></div>

        {/* How We Negotiate Title */}
        <h2 style={{textAlign: 'center', margin: '20px auto', maxWidth: 'var(--wrapper-width)', padding: '0 16px', fontSize: '24px', fontWeight: '600', color: '#2c3e50'}}>How We Negotiate</h2>

        {/* Introduction Text */}
        <div style={{maxWidth: 'var(--wrapper-width)', margin: '0 auto 30px', padding: '0 16px'}}>
          <p style={{textAlign: 'center', lineHeight: '1.6', color: '#555', fontSize: '16px'}}>At PilotCenter.net, we understand the significant financial investment required to become a pilot, which is why we negotiate with flight schools on behalf of our trainees. Here's how our negotiation process works:</p>
        </div>

        {/* Alternating Content Section */}
        <div className="alternating-content-container">
          {/* Row 1: Image left, text right with parts 1-3 */}
          <div className="alternating-content-row">
            <div className="alternating-content-image">
              <img src="/images/dreamstime_xl_196293523.avif" alt="Negotiation process" />
            </div>
            <div className="alternating-content-text">
              <h3>1. Global Partnerships</h3>
              <p>We've built strong relationships with leading flight schools around the world. These partnerships allow us to secure exclusive discounts and offers that are not available to the general public.</p>

              <h3>2. Volume Discounts</h3>
              <p>By partnering with multiple trainees, we can negotiate group rates, lowering the overall cost of tuition and other training fees. The more students we send to a flight school, the more leverage we have to ensure you get the best deal.</p>

              <h3>3. Tailored Pricing</h3>
              <p>Not every trainee has the same needs. Whether you're pursuing a full ATPL program or just need a PPL, we work to tailor pricing packages that match your goals and budget.</p>
            </div>
          </div>
  
          {/* Row 2: Text left, image right */}
          <div className="alternating-content-row">
            <div className="alternating-content-text">
              <h3>4. Transparent Pricing</h3>
              <p>Our pricing model is fully transparent—there are no hidden fees or surprise charges. You'll know exactly what you're paying for, and we'll make sure you understand the breakdown of all costs.</p>

              <h3>5. Trust Built on Experience</h3>
              <p>Because PilotCenter.net was created by former pilot trainees and current airline pilots, we understand the challenges you face. We've been in your shoes, and we know how crucial it is to find high-quality training at a fair price. That's why you can trust us to always negotiate with your best interests in mind.</p>
            </div>
            <div className="alternating-content-image">
              <img src="/images/dreamstime_l_57066817.avif" alt="Pilot training" />
            </div>
          </div>
        </div>
  
        {/* Closing Text - moved under the row with picture and text */}
        <div style={{maxWidth: 'var(--wrapper-width)', margin: '15px auto', padding: '0 16px'}}>
          <p style={{textAlign: 'center', lineHeight: '1.4', color: '#555', fontSize: '16px', padding: '0 60px'}}>At PilotCenter.net, we are committed to helping you achieve your dream of becoming a pilot without breaking the bank. By providing detailed cost breakdowns and using our expertise to negotiate the best prices, we ensure you're getting the highest value for your investment in your aviation career.</p>
        </div>
  
        {/* CTA Section */}
        <div style={{maxWidth: 'var(--wrapper-width)', margin: '30px auto', padding: '0 16px'}}>
          <div style={{backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '800px', margin: '0 auto'}}>
            <h3 style={{color: '#2c3e50', fontSize: '24px', marginBottom: '15px'}}>Need help?</h3>
            <p style={{lineHeight: '1.6', color: '#555', fontSize: '16px', marginBottom: '20px'}}>Becoming a pilot can be a thrilling journey, but it often comes with its fair share of confusion. From understanding the various licensing requirements to navigating the complexities of flight training, it's easy to feel overwhelmed. But don't worry, we're here to help you every step of the way! Let us guide you through the process and turn your dreams of flying into reality.</p>
            <button style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0069d9';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.3)';
            }}>
              Reach Out
            </button>
          </div>
        </div>
  
      </section>
    </div>
  );
}

export default Costs;