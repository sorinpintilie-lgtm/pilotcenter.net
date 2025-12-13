import React from 'react';
import './BecomePilot.css';

function ICAORoute() {
  return (
    <div className="page-content become-pilot-page">
      <section className="hero" style={{width: '100%', padding: '0', margin: '0'}}>
        <div style={{width: '100%', padding: '0', margin: '0'}}>
          <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
            <div style={{width: '100%', maxWidth: 'none', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px'}}>
              <div style={{textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <div className="hero-kicker">BECOME A PILOT</div>
                <h1 className="hero-title">Your Path to Becoming a Pilot</h1>
                <h2 className="hero-subtitle">How to Become an Airline Pilot: A Comprehensive Guide</h2>
                <p className="hero-subtitle">Learn about the different routes and requirements to become a professional pilot.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Big Blue Container with 4 rows and 2 columns */}
      <div style={{
        backgroundColor: '#cce0ff', // Lighter blue shade
        width: '100%',
        padding: '40px 20px',
        margin: '20px 0'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0px',
          maxWidth: '1200px',
          margin: '0 auto',
          alignItems: 'center',
          justifyItems: 'center'
        }}>
          {/* Row 1 */}
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
            <img src="/images/7100d5_2ca09ef740484ab3936befd719dda6ef~mv2.avif" alt="Pilot training" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h3>Becoming an airline pilot is an exciting yet complex journey that requires careful planning, the right training, and expert guidance.</h3>
            <p>At PilotCenter.net, we simplify the process by offering personalized pilot consultation, aviation career guidance, and end-to-end pilot training support.</p>
            <p>We partner with the top flight schools worldwide, negotiate competitive flight school costs, and provide full support—at no cost to you. Whether you're exploring online flight school options, accelerated flight schools, or seeking flight school scholarships, our team ensures you're always on the right track.</p>
            <p>From your first flight lesson to your final certification, we monitor your progress to make sure you stay motivated, on schedule, and never overwhelmed. Below is a step-by-step breakdown of the three main pathways to becoming an airline pilot:</p>
            <p>EASA (Europe)</p>
            <p>FAA (United States)</p>
            <p>ICAO (Rest of the World)</p>
          </div>

          {/* Row 2 */}
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h3>The EASA Route (Europe)</h3>
            <h4>Step 1: Obtain a Class 1 Medical Certificate</h4>
            <p>Before enrolling in flight school, your first step is to secure a Class 1 Medical Certificate from an EASA-approved Aeromedical Examiner (AME). This certificate confirms you meet the physical and mental health standards required to begin professional pilot training. At PilotCenter.net, we help you locate a qualified AME in your region so you can get started with confidence and stay focused on your aviation goals.</p>
          </div>
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src="/images/dreamstime_29653134.avif" alt="Pilot training content" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>

          {/* Row 3 */}
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src="/images/dreamstime_xxl_157001658_edited.avif" alt="Pilot training content" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h4>Step 2: Choose a Flight School (ATO)</h4>
            <p>Choosing the right flight school—also known as an Approved Training Organization (ATO)—is one of the most important decisions in your pilot journey. At PilotCenter.net, we offer expert flight school selection assistance, working only with the top flight schools across Europe to match you with a program that fits your goals, location, and budget. We also negotiate with schools directly to help reduce your flight school cost.</p>
            <p>You can choose between two main training paths:</p>
            <p><strong>Integrated Training:</strong> A full-time, fast-track program that takes you from zero experience to a Commercial Pilot License (CPL) with ATPL theory in 18–24 months. Ideal for those who want to progress quickly through accelerated flight schools.</p>
            <p><strong>Modular Training:</strong> A flexible path that allows you to train at your own pace, starting with a Private Pilot License (PPL) and building up toward your CPL.</p>
            <p>Whether you're aiming for flexibility or speed, we'll ensure your pilot training support is aligned with the right ATO for you.</p>
          </div>

          {/* Row 4 */}
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h4>Step 3: Private Pilot License (PPL)</h4>
            <p>The first practical step is obtaining a PPL, which requires at least 45 flight hours. After obtaining your PPL license, the next step is to get the night rating, which is a requirement for the subsequent phase of training: the instrument rating. PilotCenter.net can guide you through the entire process, ensuring you stay on track and complete your required flight hours.</p>

            <h4>Step 4: ATPL Theory and Hour Building</h4>
            <p>Simultaneously study for your ATPL theory and build your flight hours. With our partnerships, PilotCenter.net can arrange flight schools to help you accumulate the required hours affordably and efficiently.</p>
          </div>

          {/* Row 5 - Content 9 and 10 */}
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src="/images/dreamstime_l_217194379.avif" alt="Pilot training content" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src="/images/dreamstime_l_69853862.avif" alt="Pilot training content" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>

          {/* Row 7 - Steps 5-7 */}
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h4>Step 5: Commercial Pilot License (CPL) and Multi-Engine Rating (MEP)</h4>
            <p>After completing your theory exams and building your hours, PilotCenter.net will ensure that you're enrolled in the best CPL and Multi-Engine Rating courses to take your career to the next level.</p>

            <h4>Step 6: Instrument Rating (IR)</h4>
            <p>PilotCenter.net ensures you're properly prepared for your Instrument Rating (IR), crucial for flying in all weather conditions.</p>

            <h4>Step 7: Multi-Crew Cooperation Course (MCC)</h4>
            <p>At this stage, PilotCenter.net will help you enroll in a top-tier MCC course so that you're fully prepared to work in a multi-crew cockpit.</p>
          </div>
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h4>Step 8: Airline Transport Pilot License (ATPL) and Type Rating</h4>
            <p>When you're ready to apply for your ATPL, PilotCenter.net will guide you through the application process and help you secure a Type Rating, ensuring that you are prepared to fly specific aircraft types.</p>
          </div>

          {/* Row 8 - Step 9 */}
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <h4>Step 9: Job Application and Airline Recruitment</h4>
            <p>Once all the steps are completed, PilotCenter.net will help you apply for airline positions and offer advice on interviews and recruitment processes. We stay with you every step of the way to make sure you succeed.</p>
          </div>

          {/* Row 9 - Commitment Message */}
          <div style={{textAlign: 'center', width: '100%', height: '100%', gridColumn: 'span 2'}}>
            <p>At <strong>PilotCenter.net</strong>, we are committed to guiding you through every step of your pilot training journey, no matter which certification path you choose. By working with flight schools around the world and negotiating the best prices, we ensure that cost will never be a barrier. Plus, we'll monitor your progress, making sure you stay on course and reach your dream of becoming an airline pilot.</p>
          </div>
        </div>

      </div>

      {/* CTA Section */}
      <div style={{
        backgroundColor: 'rgb(220, 220, 220)',
        padding: '60px 40px',
        margin: '0 0 0 0',
        textAlign: 'center',
        width: '100%'
      }}>
        <h2 style={{fontSize: '42px', marginBottom: '20px'}}>Let us help you!</h2>
        <p style={{fontSize: '18px', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto 30px'}}>Becoming a pilot is an exciting journey, but it also be a bit overwhelming at times. With so much information to process, it's easy to feel confused about where to start. If you have questions or need guidance, don't hesitate to reach out. Let's navigate this adventure together!</p>
        <button style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          fontSize: '18px',
          borderRadius: '6px',
          cursor: 'pointer',
          marginTop: '20px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}>Reach Out</button>
      </div>
    </div>
  );
}

export default ICAORoute;