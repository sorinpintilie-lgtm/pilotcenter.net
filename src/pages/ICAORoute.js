import React from "react";
import "./FAARoute.css";

function ICAORoute() {
  return (
    <div className="faa-page">

      {/* HERO – same spirit as Become a Pilot */}
      <section className="faa-hero">
        <div className="wrapper">
          <div className="faa-hero-container">
            <div className="faa-hero-column">
              <h1 className="faa-kicker">BECOME A PILOT</h1>
              <h2 className="faa-title">The ICAO Route (International)</h2>
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

            {/* The ICAO Route Title */}
            <div className="faa-full-width">
              <h2>The ICAO Route (International)</h2>
            </div>

            {/* Step 1 - Medical Certificate - Text then Image */}
            <div className="faa-text-content">
              <h4>Medical certificate</h4>
              <h3>Step 1: Obtain a Class 1 Medical Certificate</h3>
              <p>No matter where you are in the world, the first step is securing a Class 1 Medical Certificate from an ICAO member state. PilotCenter.net can assist in finding a trusted Aeromedical Examiner in your country.</p>
            </div>
            <div className="faa-image-content">
              <img src="/dreamstime_xxl_30852901_edited.jpg" alt="Happy private pilot with plane" className="faa-grid-image" />
            </div>

            {/* Step 2 - Private Pilot License - Image then Text */}
            <div className="faa-image-content">
              <img src="/dreamstime_xxl_36712195_edited.jpg" alt="Pilot mentorship" className="faa-grid-image" />
            </div>
            <div className="faa-text-content">
              <h4>Private pilot license</h4>
              <h3>Step 2: Private Pilot License (PPL)</h3>
              <p>Obtaining your PPL is the first milestone in your pilot training. With PilotCenter.net as your partner, you’ll receive guidance and assistance in choosing the right school to start your journey.</p>
            </div>

            {/* Step 3 - Build Flight Hours and Complete Theory Training - Text then Image */}
            <div className="faa-text-content">
              <h4>Flight hours and theory</h4>
              <h3>Step 3: Build Flight Hours and Complete Theory Training</h3>
              <p>To obtain your Commercial Pilot License (CPL), you’ll need to accumulate flight hours and study for theoretical exams. PilotCenter.net negotiates the best prices for your training and ensures you stay on track to reach your flight hour goals.</p>
            </div>
            <div className="faa-image-content">
              <img src="/Airplane Wing_edited.jpg" alt="Airplane wing detail" className="faa-grid-image" />
            </div>

            {/* Step 4 - Commercial Pilot License - Image then Text */}
            <div className="faa-image-content">
              <img src="/dreamstime_l_45826253_edited.jpg" alt="Commercial pilot in cockpit" className="faa-grid-image" />
            </div>
            <div className="faa-text-content">
              <h4>Commercial pilot license</h4>
              <h3>Step 4: Commercial Pilot License (CPL)</h3>
              <p>Your CPL allows you to be paid for flying, and PilotCenter.net will make sure you have access to the best CPL programs available in your region.</p>
            </div>

            {/* Step 5 - Instrument Rating - Text then Image */}
            <div className="faa-text-content">
              <h4>Instrument rating</h4>
              <h3>Step 5: Instrument Rating (IR)</h3>
              <p>Obtaining an IR is essential for professional pilots. PilotCenter.net works with flight schools worldwide to offer you the most effective and affordable IR training options.</p>
            </div>
            <div className="faa-image-content">
              <img src="/unexperienced pilot walking down hallway happy with 2 more experienced pilots.jpg" alt="Flight safety training" className="faa-grid-image" />
            </div>

            {/* Step 6 - Multi-Engine Rating - Image then Text */}
            <div className="faa-image-content">
              <img src="/dreamstime_xl_196293523_edited.jpg" alt="Multiple aircraft arrivals" className="faa-grid-image" />
            </div>
            <div className="faa-text-content">
              <h4>Multi-engine rating</h4>
              <h3>Step 6: Multi-Engine Rating (MEP)</h3>
              <p>To fly larger, multi-engine aircraft, you’ll need a Multi-Engine Rating. With PilotCenter.net, you can secure the best training options without worrying about costs.</p>
            </div>

            {/* Step 7 - Airline Transport Pilot License - Text then Image */}
            <div className="faa-text-content">
              <h4>Airline transport pilot license</h4>
              <h3>Step 7: Airline Transport Pilot License (ATPL)</h3>
              <p>Once you’ve built up enough hours, you’ll be ready for your ATPL. PilotCenter.net will assist with the application process and help you prepare for the ATPL exam.</p>
            </div>
            <div className="faa-image-content">
              <img src="/dreamstime_xl_37135215_edited.jpg" alt="Air traffic controller" className="faa-grid-image" />
            </div>

            {/* Step 8 - Type Rating - Image then Text */}
            <div className="faa-image-content">
              <img src="/2022-fall-training-shoot-sr-sim-03-8192x5219-4366849-scaled.jpg.webp" alt="Advanced flight simulator training" className="faa-grid-image" />
            </div>
            <div className="faa-text-content">
              <h4>Type rating</h4>
              <h3>Step 8: Type Rating</h3>
              <p>Before flying for an airline, you’ll need a Type Rating for the specific aircraft. We’ll make sure you’re connected with the best training centers for your Type Rating.</p>
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

export default ICAORoute;