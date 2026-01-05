import React from 'react';
import { Link } from 'react-router-dom';
import './BecomePilot.css';

function BecomePilot() {
  return (
    <div className="page-content become-pilot-page">
      {/* NEW CLEAN HERO - NO IMAGES ON ANY DEVICE */}
      <section className="hero" style={{
        width: '100%',
        padding: '60px 20px',
        margin: '0',
        background: 'linear-gradient(to bottom, #ffffff 0%, #eef5ff 50%, #d7e8ff 100%)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div className="hero-kicker" style={{
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#2563eb',
            marginBottom: '12px',
            textAlign: 'center'
          }}>BECOME A PILOT</div>

          <h1 className="hero-title" style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            color: '#111827',
            marginBottom: '16px',
            lineHeight: '1.2',
            fontWeight: '700'
          }}>How to Become an Airline Pilot: A Comprehensive Guide</h1>

          <h2 className="hero-subtitle" style={{
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            color: '#374151',
            marginBottom: '24px',
            lineHeight: '1.4',
            fontWeight: '500',
            textAlign: 'center'
          }}>Your Journey to Becoming a Professional Pilot</h2>

          <p style={{
            fontSize: '16px',
            color: '#4b5563',
            maxWidth: '800px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            At PilotCenter.net, we guide you through every step of becoming an airline pilot -
            from medical certification to airline recruitment. Get expert support, compare flight schools,
            and stay on track with your training.
          </p>
        </div>
      </section>

      {/* Moved Content Section */}
      <section style={{
        backgroundColor: '#cce0ff',
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
          {/* Introduction Section */}
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h3>Becoming an airline pilot requires following a structured and informed path — and at PilotCenter.net, we're here to make that journey easier and more affordable.</h3>
            <p>We partner with some of the best flight schools and top flight training programs worldwide, helping you compare options, understand flight school costs, and stay on track throughout your pilot training.</p>
            <p>Whether you're looking for an accelerated flight school, exploring online flight school options for ground training, or applying for flight school scholarships, we provide expert guidance — all at no cost to you.</p>
          </div>
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
            <img src="/images/7100d5_2ca09ef740484ab3936befd719dda6ef~mv2.avif" alt="Pilot training" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>

          {/* Expert Support Section */}
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src="/images/dreamstime_29653134.avif" alt="Pilot training support" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h3>Expert Support from Start to Finish</h3>
            <p>Our team supports you every step of the way. We'll help you choose the right flight school, negotiate competitive pricing, and monitor your progress to make sure you're flying consistently, staying motivated, and not falling behind. Too many students quit because they lack the right support — we're here to make sure that doesn't happen.</p>
          </div>
        </div>
      </section>

      {/* Global Pathways Section */}
      <div style={{backgroundColor: 'white', width: '100%', padding: '40px 20px', margin: '20px 0'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', textAlign: 'center'}}>
          <h2 style={{fontSize: '32px', marginBottom: '20px', color: '#007bff'}}>Explore Global Pilot Training Pathways</h2>
          <p style={{fontSize: '18px', lineHeight: '1.6', marginBottom: '30px'}}>
            We break down the three major routes to becoming an airline pilot, depending on your region:
          </p>
          <div style={{display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap'}}>
            <Link to="/the-easa-route" className="pathway-card" style={{
              padding: '25px 20px',
              backgroundColor: 'rgba(0,123,255,0.05)',
              borderRadius: '12px',
              boxShadow: '0 6px 20px rgba(0,123,255,0.2)',
              textDecoration: 'none',
              display: 'block',
              minWidth: '200px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              border: '2px solid #007bff'
            }}>
              <h3 style={{color: '#007bff', margin: '0 0 10px 0', fontSize: '20px', textShadow: 'none'}}>EASA (Europe)</h3>
              <p style={{color: '#666', margin: '0', fontSize: '14px'}}>European Aviation Safety Agency certification pathway</p>
            </Link>
            <Link to="/the-faa-route" className="pathway-card" style={{
              padding: '25px 20px',
              backgroundColor: 'rgba(0,123,255,0.05)',
              borderRadius: '12px',
              boxShadow: '0 6px 20px rgba(0,123,255,0.2)',
              textDecoration: 'none',
              display: 'block',
              minWidth: '200px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              border: '2px solid #007bff'
            }}>
              <h3 style={{color: '#007bff', margin: '0 0 10px 0', fontSize: '20px', textShadow: 'none'}}>FAA (United States)</h3>
              <p style={{color: '#666', margin: '0', fontSize: '14px'}}>Federal Aviation Administration certification pathway</p>
            </Link>
            <Link to="/the-icao-route" className="pathway-card" style={{
              padding: '25px 20px',
              backgroundColor: 'rgba(0,123,255,0.05)',
              borderRadius: '12px',
              boxShadow: '0 6px 20px rgba(0,123,255,0.2)',
              textDecoration: 'none',
              display: 'block',
              minWidth: '200px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              border: '2px solid #007bff'
            }}>
              <h3 style={{color: '#007bff', margin: '0 0 10px 0', fontSize: '20px', textShadow: 'none'}}>ICAO (Rest of the World)</h3>
              <p style={{color: '#666', margin: '0', fontSize: '14px'}}>International Civil Aviation Organization standards</p>
            </Link>
          </div>
          <p style={{fontSize: '16px', marginTop: '20px'}}>
            Each system has its own training structure, flight school cost, and licensing process. Our platform helps you compare requirements, choose from the top flight schools, and start your training with confidence.
          </p>
        </div>
      </div>

      {/* Big Blue Container with comprehensive guide content */}
      <div style={{
        backgroundColor: '#cce0ff',
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
          {/* Step-by-Step Process */}
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h3>The Step-by-Step Process to Becoming an Airline Pilot</h3>

            <h4>Step 1: Obtain Your Medical Certificate</h4>
            <p>Before you can begin flight training, you need to obtain a Class 1 Medical Certificate from an approved aviation medical examiner. This ensures you meet the physical and mental requirements to become a professional pilot.</p>

            <h4>Step 2: Choose the Right Flight School</h4>
            <p>Selecting the right flight school is crucial. We help you compare the best flight schools based on your goals, location, and budget. Whether you're looking for accelerated flight schools or traditional programs, we'll find the right fit.</p>

            <h4>Step 3: Private Pilot License (PPL)</h4>
            <p>Your first major milestone is obtaining your Private Pilot License, which allows you to fly small aircraft. This typically requires around 45-60 flight hours and includes both flight training and ground school.</p>
          </div>
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src="/images/dreamstime_l_217194379.avif" alt="Private pilot training" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>

          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src="/images/dreamstime_l_69853862.avif" alt="Advanced pilot training" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h4>Step 4: Build Flight Hours and ATPL Theory</h4>
            <p>After obtaining your PPL, you'll need to build flight hours while studying for your Airline Transport Pilot License (ATPL) theory exams. This phase is critical for developing your skills and knowledge.</p>

            <h4>Step 5: Commercial Pilot License (CPL) and Instrument Rating (IR)</h4>
            <p>With sufficient flight hours and theory knowledge, you'll work toward your Commercial Pilot License and Instrument Rating. These qualifications allow you to fly for compensation and in various weather conditions.</p>

            <h4>Step 6: Multi-Crew Cooperation (MCC) Course</h4>
            <p>Modern airline operations require pilots to work effectively in multi-crew environments. The MCC course prepares you for this aspect of professional flying.</p>
          </div>

          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h4>Step 7: Obtain Your Airline Transport Pilot License (ATP)</h4>
            <p>After reaching the required 1,500 flight hours, you're eligible to pursue your Airline Transport Pilot License (ATP) — the highest level of pilot certification and your final step toward becoming a commercial airline pilot.</p>
            <p>PilotCenter.net supports you through this critical phase by helping you schedule and prepare for the ATP written and practical exams. We connect you with top flight schools and training providers to ensure you're confident, well-prepared, and fully qualified for a professional flying career.</p>
          </div>
          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src="/images/dreamstime_xxl_157001658_edited.avif" alt="ATP training" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>

          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h4>Step 8: Get Your Type Rating</h4>
            <p>Once you’ve earned your Airline Transport Pilot License (ATP), the final step is obtaining a Type Rating for the specific aircraft you’ll be flying — such as a Boeing 737 or Airbus A320. This specialized training is mandatory for larger commercial jets.</p>
            <p>PilotCenter.net helps you find the best flight schools and training centers that offer Type Rating programs tailored to your career goals. Whether you're looking for full-service academies or accelerated flight school options, we’ll guide you to the right fit for a smooth transition into the airline industry.</p>
          </div>

          <div style={{textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', margin: '20px 0'}}>
            <h4>Step 9: Job Applications & Airline Recruitment</h4>
            <p>With all your training complete, the final step is landing your first airline job. From submitting applications to preparing for interviews, PilotCenter.net is with you every step of the way.</p>
            <p>We provide guidance on crafting a strong resume, understanding airline recruitment processes, and standing out in competitive job markets. Whether you trained at an accelerated flight school, pursued flight school scholarships, or chose a traditional path, our goal is to help you transition smoothly from student to professional pilot.</p>
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
        <h2 style={{fontSize: '42px', marginBottom: '20px'}}>Start Your Journey with PilotCenter.net</h2>
        <p style={{fontSize: '18px', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto 30px'}}>
          At PilotCenter.net, we're dedicated to guiding you through every stage of your pilot training — from your first medical exam to airline recruitment. No matter which certification path you choose, we connect you with the best flight schools, including accelerated flight schools, online flight school options, and programs that offer flight school scholarships.
        </p>
        <p style={{fontSize: '16px', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto 30px'}}>
          By working with trusted flight schools worldwide and helping you understand how much flight school costs, we ensure that financial barriers don’t stand in the way of your dream. We’ll be with you every step of the way — monitoring your progress and keeping you on track to become a successful airline pilot.
        </p>
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
        }}>Let us help you!</button>
      </div>
    </div>
  );
}

export default BecomePilot;