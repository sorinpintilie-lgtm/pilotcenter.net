import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Costs.css';

function Costs() {
  const [activeCostTab, setActiveCostTab] = useState('easa');

  const costTabs = [
    {
      key: 'easa',
      title: 'EASA Cost Breakdown',
      heading: 'EASA Route (Europe)',
      lines: [
        { label: 'Private Pilot License (PPL):', value: '€10,000 - €15,000' },
        { label: 'Commercial Pilot License (CPL):', value: '€30,000 - €45,000' },
        { label: 'Airline Transport Pilot License (ATPL):', value: '€70,000 - €100,000' }
      ],
      summary: 'This route generally has higher costs due to stringent requirements and specific certifications. However, completing EASA training can open doors to flying with European and other international airlines.'
    },
    {
      key: 'faa',
      title: 'FAA Cost Breakdown',
      heading: 'FAA Route (United States)',
      lines: [
        { label: 'Private Pilot License (PPL):', value: '$8,000 - $12,000' },
        { label: 'Commercial Pilot License (CPL):', value: '$20,000 - $35,000' },
        { label: 'Airline Transport Pilot License (ATP):', value: '$60,000 - $80,000' }
      ],
      summary: 'The FAA path tends to be more affordable compared to the EASA route and is widely recognized by airlines based in the U.S. and other ICAO-member countries.'
    },
    {
      key: 'icao',
      title: 'ICAO Cost Breakdown',
      heading: 'ICAO Route (Rest of the World)',
      lines: [
        { label: 'Private Pilot License (PPL):', value: '$10,000 - $18,000 (depending on the region)' },
        { label: 'Commercial Pilot License (CPL):', value: '$25,000 - $40,000' },
        { label: 'Airline Transport Pilot License (ATPL):', value: '$60,000 - $90,000' }
      ],
      summary: 'ICAO offers a flexible path for those looking to work with international airlines or in countries outside Europe and the U.S. The costs can vary significantly depending on the country and training institution.'
    }
  ];

  const activeTab = costTabs.find((tab) => tab.key === activeCostTab) || costTabs[0];

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
          {costTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`costs-option-column${activeCostTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveCostTab(tab.key)}
              aria-pressed={activeCostTab === tab.key}
            >
              <h3 className="costs-option-title">{tab.title}</h3>
            </button>
          ))}
        </div>

        <div className="costs-content-display">
          <div className="costs-content-text active">
            <h3>{activeTab.heading}</h3>
            {activeTab.lines.map((line) => (
              <p key={`${activeTab.key}-${line.label}`}>
                <strong>{line.label}</strong> {line.value}
              </p>
            ))}
            <p>{activeTab.summary}</p>
          </div>
        </div>

        {/* Additional Costs Section */}
        <div className="costs-content-display">
          <div className="costs-content-text costs-additional-card active">
            <h3>Additional Costs to Consider (varies by school and country)</h3>
            <p><strong>Ground School Fees:</strong> €1,000 - €5,000 / $1,000 - $4,000 (varies by school)</p>
            <p><strong>Examination Fees:</strong> €500 - €2,000 / $500 - $1,500</p>
            <p><strong>Medical Certification:</strong> €200 - €800 / $150 - $600</p>
            <p><strong>Accommodation and Living Expenses:</strong> Depending on the location, living costs can significantly impact the overall budget.</p>
          </div>
        </div>

        {/* Blue Separation Bar */}
        <div className="costs-separator"></div>

        {/* How We Negotiate Title */}
        <h2 className="costs-negotiate-title">How We Negotiate</h2>

        {/* Introduction Text */}
        <div className="costs-negotiate-intro">
          <p>At PilotCenter.net, we understand the significant financial investment required to become a pilot, which is why we negotiate with flight schools on behalf of our trainees. Here's how our negotiation process works:</p>
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
        <div className="costs-closing-copy">
          <p>At PilotCenter.net, we are committed to helping you achieve your dream of becoming a pilot without breaking the bank. By providing detailed cost breakdowns and using our expertise to negotiate the best prices, we ensure you're getting the highest value for your investment in your aviation career.</p>
        </div>
  
        {/* CTA Section */}
        <div className="costs-cta-wrapper">
          <div className="costs-cta-card">
            <h3>Need help?</h3>
            <p>Becoming a pilot can be a thrilling journey, but it often comes with its fair share of confusion. From understanding the various licensing requirements to navigating the complexities of flight training, it's easy to feel overwhelmed. But don't worry, we're here to help you every step of the way! Let us guide you through the process and turn your dreams of flying into reality.</p>
            <Link className="costs-cta-button" to="/consultation-booking">
              Reach Out
            </Link>
          </div>
        </div>
  
      </section>
    </div>
  );
}

export default Costs;
