import React from "react";
import "./FAARoute.css";

function EASARoute() {
  return (
    <div className="faa-page">

      {/* HERO – same spirit as Become a Pilot */}
      <section className="faa-hero">
        <div className="wrapper">
          <div className="faa-hero-container">
            <div className="faa-hero-column">
              <h1 className="faa-kicker">BECOME A PILOT</h1>
              <h2 className="faa-title">The EASA Route (Europe)</h2>
              <p className="faa-lead">
                Becoming an airline pilot requires following a structured and informed path and at PilotCenter.net, we're here to make that journey easier and more affordable. We partner with some of the best flight schools and top flight training programs worldwide, helping you compare options, understand flight school costs, and stay on track throughout your pilot training.
              </p>
              <p className="faa-lead">
                Whether you're looking for an accelerated flight school, exploring online flight school options for ground training, or applying for flight school scholarships, we provide expert guidance — all at no cost to you.
              </p>
            </div>
            <div className="faa-hero-column">
              <img src="/dreamstime_xxl_157001658_edited.jpg" alt="Happy pilot with uniform" className="faa-hero-image" />
            </div>
          </div>
        </div>
      </section>

      {/* EXPERT SUPPORT SECTION - FULL WIDTH WHITE CONTAINER */}
      <section className="faa-expert-support">
        <div className="wrapper">
          <div className="faa-expert-support-container">
            <div className="faa-expert-support-column">
              <div className="block-muted-inner">
                <h3>Expert Support from Start to Finish</h3>
                <p>Our team supports you every step of the way. We'll help you choose the right flight school, negotiate competitive pricing, and monitor your progress to make sure you're flying consistently, staying motivated, and not falling behind. Too many students quit because they lack the right support — we're here to make sure that doesn't happen.</p>
              </div>
            </div>
            <div className="faa-expert-support-column"></div>
          </div>
        </div>
      </section>

      {/* TWO-COLUMN CONTENT SECTIONS - LIKE BECOME A PILOT */}
      <section className="faa-two-column-container">
        <div className="wrapper">
          <div className="faa-grid">

            {/* The EASA Route Title */}
            <div className="faa-full-width">
              <h2>The EASA Route (Europe)</h2>
            </div>

            {/* Step 1 - Medical Certificate - Text then Image */}
            <div className="faa-text-content">
              <h4>Medical certificate</h4>
              <h3>Step 1: Obtain a Class 1 Medical Certificate</h3>
              <p>Before you begin your journey, it’s important to secure a Class 1 Medical Certificate from an EASA-approved Aeromedical Examiner (AME). PilotCenter.net can assist in finding the nearest AME to get you started.</p>
            </div>
            <div className="faa-image-content">
              <img src="/prive pilot smiling being happy with a plane.jpg" alt="Happy private pilot with plane" className="faa-grid-image" />
            </div>

            {/* Step 2 - Choose a Flight School - Image then Text */}
            <div className="faa-image-content">
              <img src="/dreamstime_xxl_76484799_edited.jpg" alt="Pilot mentorship" className="faa-grid-image" />
            </div>
            <div className="faa-text-content">
              <h4>Flight school</h4>
              <h3>Step 2: Choose a Flight School (ATO)</h3>
              <p>Selecting the right Approved Training Organization (ATO) is crucial. PilotCenter.net works with the top flight schools across Europe and can help you choose the best fit based on your location, needs, and budget. Plus, we negotiate on your behalf to ensure you get the best prices possible.</p>
            </div>

            {/* Step 3 - Private Pilot License - Text then Image */}
            <div className="faa-text-content">
              <h4>Private pilot license</h4>
              <h3>Step 3: Private Pilot License (PPL)</h3>
              <p>The first practical step is obtaining a PPL, which requires at least 45 flight hours. After obtaining your PPL license, the next step is to get the night rating, which is a requirement for the subsequent phase of training: the instrument rating. PilotCenter.net can guide you through the entire process, ensuring you stay on track and complete your required flight hours.</p>
            </div>
            <div className="faa-image-content">
              <img src="/-post-ai-image-108.png.webp" alt="Airplane wing detail" className="faa-grid-image" />
            </div>

            {/* Step 4 - ATPL Theory and Hour Building - Image then Text */}
            <div className="faa-image-content">
              <img src="/dreamstime_l_57066817_edited.jpg" alt="Commercial pilot in cockpit" className="faa-grid-image" />
            </div>
            <div className="faa-text-content">
              <h4>Theory and hour building</h4>
              <h3>Step 4: ATPL Theory and Hour Building</h3>
              <p>Simultaneously study for your ATPL theory and build your flight hours. With our partnerships, PilotCenter.net can arrange flight schools to help you accumulate the required hours affordably and efficiently.</p>
            </div>

            {/* Step 5 - Instrument Rating - Text then Image */}
            <div className="faa-text-content">
              <h4>Instrument rating</h4>
              <h3>Step 5: Instrument Rating (IR)</h3>
              <p>PilotCenter.net ensures you’re properly prepared for your Instrument Rating (IR), crucial for flying in all weather conditions.</p>
            </div>
            <div className="faa-image-content">
              <img src="/Safety1.jpg" alt="Flight safety training" className="faa-grid-image" />
            </div>

            {/* Step 6 - Commercial Pilot License - Image then Text */}
            <div className="faa-image-content">
              <img src="/dreamstime_l_217194379.avif" alt="Multiple aircraft arrivals" className="faa-grid-image" />
            </div>
            <div className="faa-text-content">
              <h4>Commercial pilot license</h4>
              <h3>Step 6: Commercial Pilot License (CPL) and Multi-Engine Rating (MEP)</h3>
              <p>After completing your theory exams and building your hours, PilotCenter.net will ensure that you're enrolled in the best CPL and Multi-Engine Rating courses to take your career to the next level.</p>
            </div>

            {/* Step 7 - Multi-Crew Cooperation - Text then Image */}
            <div className="faa-text-content">
              <h4>Multi-crew cooperation</h4>
              <h3>Step 7: Multi-Crew Cooperation Course (MCC)</h3>
              <p>At this stage, PilotCenter.net will help you enroll in a top-tier MCC course so that you’re fully prepared to work in a multi-crew cockpit.</p>
            </div>
            <div className="faa-image-content">
              <img src="/Air traffic controller sitting in tower happy smiling with windows in background with clear blue sky.jpg" alt="Air traffic controller" className="faa-grid-image" />
            </div>

            {/* Step 8 - Airline Transport Pilot License - Image then Text */}
            <div className="faa-image-content">
              <img src="/2022-fall-training-shoot-sr-sim-03-8192x5219-4366849-scaled.jpg.webp" alt="Advanced flight simulator training" className="faa-grid-image" />
            </div>
            <div className="faa-text-content">
              <h4>Airline transport pilot license</h4>
              <h3>Step 8: Airline Transport Pilot License (ATPL) and Type Rating</h3>
              <p>When you’re ready to apply for your ATPL, PilotCenter.net will guide you through the application process and help you secure a Type Rating, ensuring that you are prepared to fly specific aircraft types.</p>
            </div>

            {/* Step 9 - Job Applications - Text then Image */}
            <div className="faa-text-content">
              <h3>Step 9: Job Application and Airline Recruitment</h3>
              <p>Once all the steps are completed, PilotCenter.net will help you apply for airline positions and offer advice on interviews and recruitment processes. We stay with you every step of the way to make sure you succeed.</p>
            </div>
            <div className="faa-image-content">
              <img src="/Expert support pilot smiling, helping a person, with a notepad in hand near airplane.jpg" alt="Pilot career guidance" className="faa-grid-image" />
            </div>

            {/* Start Your Journey Section - Full Width */}
            <div className="faa-full-width">
              <h3>Start Your Journey with PilotCenter.net</h3>
              <p>At PilotCenter.net, we are committed to guiding you through every step of your pilot training journey, no matter which certification path you choose. By working with flight schools around the world and negotiating the best prices, we ensure that cost will never be a barrier. Plus, we’ll monitor your progress, making sure you stay on course and reach your dream of becoming an airline pilot.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="faa-cta">
        <div className="wrapper">
          <div className="faa-cta-container">
            <h3>Let us help you!</h3>
            <p>
              Becoming a pilot can be a thrilling journey, but it often comes with its fair share of confusion. From understanding the various licensing requirements to navigating the complexities of flight training, it's easy to feel overwhelmed. But don't worry, we're here to help you every step of the way! Let us guide you through the process and turn your dreams of flying into reality.
            </p>
            <a href="/contact" className="btn btn-blue">Reach Out</a>
          </div>
        </div>
      </section>

    </div>
  );
}

export default EASARoute;