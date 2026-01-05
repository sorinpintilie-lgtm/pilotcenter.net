import React from "react";
import "./FAARoute.css";

function FaaRoute() {
  return (
    <div className="faa-page">

      {/* HERO – same spirit as Become a Pilot */}
      <section className="faa-hero">
        <div className="wrapper">
          <div className="faa-hero-container">
            <div className="faa-hero-column">
              <h1 className="faa-kicker">BECOME A PILOT</h1>
              <h2 className="faa-title">The FAA Route (United States)</h2>
              <p className="faa-lead">
                Becoming an airline pilot requires following a structured and informed path and at PilotCenter.net, we're here to make that journey easier and more affordable. We partner with some of the best flight schools and top flight training programs worldwide, helping you compare options, understand flight school costs, and stay on track throughout your pilot training.
              </p>
              <p className="faa-lead">
                Whether you're looking for an accelerated flight school, exploring online flight school options for ground training, or applying for flight school scholarships, we provide expert guidance — all at no cost to you.
              </p>
            </div>
            <div className="faa-hero-column">
              <img src="/dreamstime_xxl_149985267_edited.jpg" alt="Happy pilot with uniform" className="faa-hero-image" />
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

            {/* The FAA Route Title */}
            <div className="faa-full-width">
              <h2>The FAA Route (USA)</h2>
            </div>

            {/* Step 1 - Medical Certificate - Text then Image */}
            <div className="faa-text-content">
              <h4>Medical certificate</h4>
              <h3>Step 1: Obtain a Class 1 Medical Certificate</h3>
              <p>Your journey to becoming an airline pilot starts with securing an FAA Class 1 Medical Certificate. This certificate ensures you meet the health and vision requirements to begin training at a flight school.</p>
              <p>At PilotCenter.net, we make this step simple by connecting you with FAA-approved Aviation Medical Examiners in your area, so you can start your training without delay. Whether you're aiming to enroll in an accelerated flight school or researching how much flight school costs, this is your first essential step toward the cockpit.</p>
            </div>
            <div className="faa-image-content">
              <img src="/prive pilot smiling being happy with a plane.jpg" alt="Happy private pilot with plane" className="faa-grid-image" />
            </div>

            {/* Step 2 - Private Pilot License - Image then Text */}
            <div className="faa-image-content">
              <img src="/dreamstime_xxl_76484799_edited.jpg" alt="Pilot mentorship" className="faa-grid-image" />
            </div>
            <div className="faa-text-content">
              <h4>Private pilot license</h4>
              <h3>Step 2: Earn Your Private Pilot License (PPL)</h3>
              <p>The first major milestone in your pilot journey is earning your Private Pilot License (PPL), which requires a minimum of 40 flight hours. This license allows you to fly single-engine aircraft for personal use and lays the foundation for more advanced training.</p>
              <p>PilotCenter.net partners with top flight schools in the U.S. to help you find the best flight school for your goals, compare flight school costs, and even access flight school scholarships when available. Whether you're looking for traditional programs or an accelerated flight school, we help you make the right choice for your PPL training.</p>
            </div>

            {/* Step 3 - Instrument Rating - Text then Image */}
            <div className="faa-text-content">
              <h4>Instrument rating</h4>
              <h3>Step 3: Obtain Your Instrument Rating (IR)</h3>
              <p>After earning your PPL, the next step is to add an Instrument Rating (IR), which qualifies you to fly under Instrument Flight Rules (IFR) — essential for flying in low visibility and poor weather conditions.</p>
              <p>PilotCenter.net supports you through this advanced phase by helping you enroll in top flight schools that offer high-quality IR training. We monitor your progress to ensure you're staying on track and making the most of your flight hours, whether you're training full-time or through an accelerated flight school program.</p>
            </div>
            <div className="faa-image-content">
              <img src="/-post-ai-image-108.png.webp" alt="Airplane wing detail" className="faa-grid-image" />
            </div>

            {/* Step 4 - Commercial Pilot License - Image then Text */}
            <div className="faa-image-content">
              <img src="/dreamstime_l_57066817_edited.jpg" alt="Commercial pilot in cockpit" className="faa-grid-image" />
            </div>
            <div className="faa-text-content">
              <h4>Commercial pilot license</h4>
              <h3>Step 4: Earn Your Commercial Pilot License (CPL)</h3>
              <p>To qualify for paid flying jobs, you'll need a Commercial Pilot License (CPL). This license requires a minimum of 250 flight hours and builds on your previous training with advanced maneuvers, navigation skills, and safety procedures.</p>
              <p>At PilotCenter.net, we work closely with some of the best flight schools and accelerated flight school programs to ensure you're on the most efficient path to earning your CPL. We also help you understand the true flight school cost up front — so there are no financial surprises along the way.</p>
            </div>

            {/* Step 5 - Time Building - Text then Image */}
            <div className="faa-text-content">
              <h4>Time building</h4>
              <h3>Step 5: Build Flight Hours (Time Building)</h3>
              <p>To qualify for your Airline Transport Pilot License (ATP), you'll need to accumulate 1,500 total flight hours. This phase is often called time building, and it's a crucial step on your journey to becoming a professional pilot.</p>
              <p>PilotCenter.net helps you explore the most cost-effective and efficient time-building opportunities, such as working as a flight instructor or taking on other entry-level flying roles. We work with top flight schools to ensure you're gaining quality experience while staying on track — financially and professionally — toward your goal.</p>
            </div>
            <div className="faa-image-content">
              <img src="/Safety1.jpg" alt="Flight safety training" className="faa-grid-image" />
            </div>

            {/* Step 6 - Multi-Engine Rating - Image then Text */}
            <div className="faa-image-content">
              <img src="/dreamstime_l_217194379.avif" alt="Multiple aircraft arrivals" className="faa-grid-image" />
            </div>
            <div className="faa-text-content">
              <h4>Multi-engine rating</h4>
              <h3>Step 6: Earn Your Multi-Engine Rating (MEP)</h3>
              <p>To fly commercial airliners, you'll need a Multi-Engine Rating (MEP) — a key requirement for handling aircraft with more than one engine. This rating enhances your skills and prepares you for the complexity of airline operations.</p>
              <p>PilotCenter.net connects you with top flight schools offering expert multi-engine training. We make sure you receive high-quality instruction and stay on track to complete this vital step efficiently, whether through a standard or accelerated flight school program.</p>
            </div>

            {/* Step 7 - Airline Transport Pilot License - Text then Image */}
            <div className="faa-text-content">
              <h4>Airline transport pilot license</h4>
              <h3>Step 7: Obtain Your Airline Transport Pilot License (ATP)</h3>
              <p>After reaching the required 1,500 flight hours, you're eligible to pursue your Airline Transport Pilot License (ATP) — the highest level of pilot certification and your final step toward becoming a commercial airline pilot.</p>
              <p>PilotCenter.net supports you through this critical phase by helping you schedule and prepare for the ATP written and practical exams. We connect you with top flight schools and training providers to ensure you're confident, well-prepared, and fully qualified for a professional flying career.</p>
            </div>
            <div className="faa-image-content">
              <img src="/Air traffic controller sitting in tower happy smiling with windows in background with clear blue sky.jpg" alt="Air traffic controller" className="faa-grid-image" />
            </div>

            {/* Step 8 - Type Rating - Image then Text */}
            <div className="faa-image-content">
              <img src="/2022-fall-training-shoot-sr-sim-03-8192x5219-4366849-scaled.jpg.webp" alt="Advanced flight simulator training" className="faa-grid-image" />
            </div>
            <div className="faa-text-content">
              <h4>Type rating</h4>
              <h3>Step 8: Get Your Type Rating</h3>
              <p>Once you've earned your Airline Transport Pilot License (ATP), the final step is obtaining a Type Rating for the specific aircraft you'll be flying — such as a Boeing 737 or Airbus A320. This specialized training is mandatory for larger commercial jets.</p>
              <p>PilotCenter.net helps you find the best flight schools and training centers that offer Type Rating programs tailored to your career goals. Whether you're looking for full-service academies or accelerated flight school options, we'll guide you to the right fit for a smooth transition into the airline industry.</p>
            </div>

            {/* Step 9 - Job Applications - Text then Image */}
            <div className="faa-text-content">
              <h3>Step 9: Job Applications & Airline Recruitment</h3>
              <p>With all your training complete, the final step is landing your first airline job. From submitting applications to preparing for interviews, PilotCenter.net is with you every step of the way.</p>
              <p>We provide guidance on crafting a strong resume, understanding airline recruitment processes, and standing out in competitive job markets. Whether you trained at an accelerated flight school, pursued flight school scholarships, or chose a traditional path, our goal is to help you transition smoothly from student to professional pilot.</p>
            </div>
            <div className="faa-image-content">
              <img src="/Expert support pilot smiling, helping a person, with a notepad in hand near airplane.jpg" alt="Pilot career guidance" className="faa-grid-image" />
            </div>

            {/* Start Your Journey Section - Full Width */}
            <div className="faa-full-width">
              <h3>Start Your Journey with PilotCenter.net</h3>
              <p>At PilotCenter.net, we're dedicated to guiding you through every stage of your pilot training — from your first medical exam to airline recruitment. No matter which certification path you choose, we connect you with the best flight schools, including accelerated flight schools, online flight school options, and programs that offer flight school scholarships.</p>
              <p>By working with trusted flight schools worldwide and helping you understand how much flight school costs, we ensure that financial barriers don't stand in the way of your dream. We'll be with you every step of the way — monitoring your progress and keeping you on track to become a successful airline pilot.</p>
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

export default FaaRoute;