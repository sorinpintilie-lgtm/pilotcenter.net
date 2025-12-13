import React from 'react';
import { Link } from 'react-router-dom';
import './BecomePilot.css';

function FAARoute() {
  return (
    <div className="page-content become-pilot-page">
      <section className="hero" style={{width: '100%', padding: '0', margin: '0'}}>
        <div style={{width: '100%', padding: '0', margin: '0'}}>
          <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
            <div style={{width: '100%', maxWidth: 'none', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px'}}>
              <div style={{textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <div className="hero-kicker">BECOME A PILOT</div>
                <h1 className="hero-title">The FAA Route (United States)</h1>
                <h2 className="hero-subtitle">Your Complete Guide to Becoming an Airline Pilot in the USA</h2>
                <p className="hero-subtitle">Follow our step-by-step FAA certification process and start your aviation career with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <div style={{
        backgroundColor: '#cce0ff',
        width: '100%',
        padding: '40px 20px',
        margin: '20px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <p style={{fontSize: '18px', lineHeight: '1.6', marginBottom: '20px'}}>
            Becoming an airline pilot requires following a structured and informed path — and at PilotCenter.net, we're here to make that journey easier and more affordable. We partner with some of the best flight schools and top flight training programs worldwide, helping you compare options, understand flight school costs, and stay on track throughout your pilot training.
          </p>
          <p style={{fontSize: '18px', lineHeight: '1.6'}}>
            Whether you're looking for an accelerated flight school, exploring online flight school options for ground training, or applying for flight school scholarships, we provide expert guidance — all at no cost to you.
          </p>
        </div>
      </div>

      {/* Expert Support Section */}
      <div style={{
        backgroundColor: '#f8f9fa',
        width: '100%',
        padding: '40px 20px',
        margin: '20px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{fontSize: '32px', marginBottom: '20px', color: '#007bff'}}>Expert Support from Start to Finish</h2>
          <p style={{fontSize: '18px', lineHeight: '1.6', marginBottom: '20px'}}>
            Our team supports you every step of the way. We'll help you choose the right flight school, negotiate competitive pricing, and monitor your progress to make sure you're flying consistently, staying motivated, and not falling behind. Too many students quit because they lack the right support — we're here to make sure that doesn't happen.
          </p>
        </div>
      </div>

      {/* Global Pathways Section */}
      <div style={{
        backgroundColor: '#cce0ff',
        width: '100%',
        padding: '40px 20px',
        margin: '20px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{fontSize: '32px', marginBottom: '20px', color: '#007bff'}}>Explore Global Pilot Training Pathways</h2>
          <p style={{fontSize: '18px', lineHeight: '1.6', marginBottom: '30px'}}>
            We break down the three major routes to becoming an airline pilot, depending on your region:
          </p>
          <div style={{display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap'}}>
            <Link to="/the-easa-route" style={{
              padding: '25px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              display: 'block',
              minWidth: '200px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              e.target.style.borderColor = '#007bff';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              e.target.style.borderColor = 'transparent';
            }}>
              <h3 style={{color: '#007bff', margin: '0 0 10px 0', fontSize: '20px'}}>EASA (Europe)</h3>
              <p style={{color: '#666', margin: '0', fontSize: '14px'}}>European Aviation Safety Agency certification pathway</p>
            </Link>
            <Link to="/the-faa-route" style={{
              padding: '25px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              display: 'block',
              minWidth: '200px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              border: '2px solid #007bff'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,123,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }}>
              <h3 style={{color: '#007bff', margin: '0 0 10px 0', fontSize: '20px'}}>FAA (United States)</h3>
              <p style={{color: '#666', margin: '0', fontSize: '14px'}}>Federal Aviation Administration certification pathway</p>
            </Link>
            <Link to="/the-icao-route" style={{
              padding: '25px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              display: 'block',
              minWidth: '200px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              e.target.style.borderColor = '#007bff';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              e.target.style.borderColor = 'transparent';
            }}>
              <h3 style={{color: '#007bff', margin: '0 0 10px 0', fontSize: '20px'}}>ICAO (Rest of the World)</h3>
              <p style={{color: '#666', margin: '0', fontSize: '14px'}}>International Civil Aviation Organization standards</p>
            </Link>
          </div>
          <p style={{fontSize: '16px', marginTop: '20px'}}>
            Each system has its own training structure, flight school cost, and licensing process. Our platform helps you compare requirements, choose from the top flight schools, and start your training with confidence.
          </p>
        </div>
      </div>

      {/* FAA Route Steps */}
      <div style={{
        backgroundColor: '#f8f9fa',
        width: '100%',
        padding: '40px 20px',
        margin: '20px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{fontSize: '36px', textAlign: 'center', marginBottom: '40px', color: '#007bff'}}>The FAA Route (USA)</h2>

          {/* Step 1 */}
          <div style={{display: 'flex', marginBottom: '40px', alignItems: 'center', gap: '30px'}}>
            <div style={{flex: '1'}}>
              <img src="/images/dreamstime_29653134.avif" alt="Medical certificate" style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}} />
            </div>
            <div style={{flex: '1'}}>
              <h3 style={{color: '#007bff', marginBottom: '15px'}}>Step 1: Obtain a Class 1 Medical Certificate</h3>
              <p>Your journey to becoming an airline pilot starts with securing an FAA Class 1 Medical Certificate. This certificate ensures you meet the health and vision requirements to begin training at a flight school.</p>
              <p>At PilotCenter.net, we make this step simple by connecting you with FAA-approved Aviation Medical Examiners in your area, so you can start your training without delay. Whether you're aiming to enroll in an accelerated flight school or researching how much flight school costs, this is your first essential step toward the cockpit.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{display: 'flex', marginBottom: '40px', alignItems: 'center', gap: '30px', flexDirection: 'row-reverse'}}>
            <div style={{flex: '1'}}>
              <img src="/images/dreamstime_xxl_157001658_edited.avif" alt="Private pilot license" style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}} />
            </div>
            <div style={{flex: '1'}}>
              <h3 style={{color: '#007bff', marginBottom: '15px'}}>Step 2: Earn Your Private Pilot License (PPL)</h3>
              <p>The first major milestone in your pilot journey is earning your Private Pilot License (PPL), which requires a minimum of 40 flight hours. This license allows you to fly single-engine aircraft for personal use and lays the foundation for more advanced training.</p>
              <p>PilotCenter.net partners with top flight schools in the U.S. to help you find the best flight school for your goals, compare flight school costs, and even access flight school scholarships when available. Whether you're looking for traditional programs or an accelerated flight school, we help you make the right choice for your PPL training.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{display: 'flex', marginBottom: '40px', alignItems: 'center', gap: '30px'}}>
            <div style={{flex: '1'}}>
              <img src="/images/dreamstime_l_217194379.avif" alt="Instrument rating" style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}} />
            </div>
            <div style={{flex: '1'}}>
              <h3 style={{color: '#007bff', marginBottom: '15px'}}>Step 3: Obtain Your Instrument Rating (IR)</h3>
              <p>After earning your PPL, the next step is to add an Instrument Rating (IR), which qualifies you to fly under Instrument Flight Rules (IFR) — essential for flying in low visibility and poor weather conditions.</p>
              <p>PilotCenter.net supports you through this advanced phase by helping you enroll in top flight schools that offer high-quality IR training. We monitor your progress to ensure you're staying on track and making the most of your flight hours, whether you're training full-time or through an accelerated flight school program.</p>
            </div>
          </div>

          {/* Step 4 */}
          <div style={{display: 'flex', marginBottom: '40px', alignItems: 'center', gap: '30px', flexDirection: 'row-reverse'}}>
            <div style={{flex: '1'}}>
              <img src="/images/dreamstime_l_69853862.avif" alt="Commercial pilot license" style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}} />
            </div>
            <div style={{flex: '1'}}>
              <h3 style={{color: '#007bff', marginBottom: '15px'}}>Step 4: Earn Your Commercial Pilot License (CPL)</h3>
              <p>To qualify for paid flying jobs, you'll need a Commercial Pilot License (CPL). This license requires a minimum of 250 flight hours and builds on your previous training with advanced maneuvers, navigation skills, and safety procedures.</p>
              <p>At PilotCenter.net, we work closely with some of the best flight schools and accelerated flight school programs to ensure you're on the most efficient path to earning your CPL. We also help you understand the true flight school cost up front — so there are no financial surprises along the way.</p>
            </div>
          </div>

          {/* Step 5 */}
          <div style={{display: 'flex', marginBottom: '40px', alignItems: 'center', gap: '30px'}}>
            <div style={{flex: '1'}}>
              <img src="/images/dreamstime_xxl_45826392.avif" alt="Time building" style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}} />
            </div>
            <div style={{flex: '1'}}>
              <h3 style={{color: '#007bff', marginBottom: '15px'}}>Step 5: Build Flight Hours (Time Building)</h3>
              <p>To qualify for your Airline Transport Pilot License (ATP), you'll need to accumulate 1,500 total flight hours. This phase is often called time building, and it's a crucial step on your journey to becoming a professional pilot.</p>
              <p>PilotCenter.net helps you explore the most cost-effective and efficient time-building opportunities, such as working as a flight instructor or taking on other entry-level flying roles. We work with top flight schools to ensure you're gaining quality experience while staying on track — financially and professionally — toward your goal.</p>
            </div>
          </div>

          {/* Step 6 */}
          <div style={{display: 'flex', marginBottom: '40px', alignItems: 'center', gap: '30px', flexDirection: 'row-reverse'}}>
            <div style={{flex: '1'}}>
              <img src="/images/dreamstime_xl_37135215.avif" alt="Multi-engine rating" style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}} />
            </div>
            <div style={{flex: '1'}}>
              <h3 style={{color: '#007bff', marginBottom: '15px'}}>Step 6: Earn Your Multi-Engine Rating (MEP)</h3>
              <p>To fly commercial airliners, you'll need a Multi-Engine Rating (MEP) — a key requirement for handling aircraft with more than one engine. This rating enhances your skills and prepares you for the complexity of airline operations.</p>
              <p>PilotCenter.net connects you with top flight schools offering expert multi-engine training. We make sure you receive high-quality instruction and stay on track to complete this vital step efficiently, whether through a standard or accelerated flight school program.</p>
            </div>
          </div>

          {/* Step 7 */}
          <div style={{display: 'flex', marginBottom: '40px', alignItems: 'center', gap: '30px'}}>
            <div style={{flex: '1'}}>
              <img src="/images/dreamstime_xxl_76484799_edited (1).avif" alt="Airline transport pilot license" style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}} />
            </div>
            <div style={{flex: '1'}}>
              <h3 style={{color: '#007bff', marginBottom: '15px'}}>Step 7: Obtain Your Airline Transport Pilot License (ATP)</h3>
              <p>After reaching the required 1,500 flight hours, you're eligible to pursue your Airline Transport Pilot License (ATP) — the highest level of pilot certification and your final step toward becoming a commercial airline pilot.</p>
              <p>PilotCenter.net supports you through this critical phase by helping you schedule and prepare for the ATP written and practical exams. We connect you with top flight schools and training providers to ensure you're confident, well-prepared, and fully qualified for a professional flying career.</p>
            </div>
          </div>

          {/* Step 8 */}
          <div style={{display: 'flex', marginBottom: '40px', alignItems: 'center', gap: '30px', flexDirection: 'row-reverse'}}>
            <div style={{flex: '1'}}>
              <img src="/images/dreamstime_xxl_157001658_edited.avif" alt="Type rating" style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}} />
            </div>
            <div style={{flex: '1'}}>
              <h3 style={{color: '#007bff', marginBottom: '15px'}}>Step 8: Get Your Type Rating</h3>
              <p>Once you've earned your Airline Transport Pilot License (ATP), the final step is obtaining a Type Rating for the specific aircraft you'll be flying — such as a Boeing 737 or Airbus A320. This specialized training is mandatory for larger commercial jets.</p>
              <p>PilotCenter.net helps you find the best flight schools and training centers that offer Type Rating programs tailored to your career goals. Whether you're looking for full-service academies or accelerated flight school options, we'll guide you to the right fit for a smooth transition into the airline industry.</p>
            </div>
          </div>

          {/* Step 9 */}
          <div style={{textAlign: 'center', marginBottom: '40px'}}>
            <h3 style={{color: '#007bff', marginBottom: '15px'}}>Step 9: Job Applications & Airline Recruitment</h3>
            <p>With all your training complete, the final step is landing your first airline job. From submitting applications to preparing for interviews, PilotCenter.net is with you every step of the way.</p>
            <p>We provide guidance on crafting a strong resume, understanding airline recruitment processes, and standing out in competitive job markets. Whether you trained at an accelerated flight school, pursued flight school scholarships, or chose a traditional path, our goal is to help you transition smoothly from student to professional pilot.</p>
          </div>
        </div>
      </div>

      {/* Start Your Journey Section */}
      <div style={{
        backgroundColor: '#cce0ff',
        width: '100%',
        padding: '40px 20px',
        margin: '20px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{fontSize: '32px', marginBottom: '20px', color: '#007bff'}}>Start Your Journey with PilotCenter.net</h2>
          <p style={{fontSize: '18px', lineHeight: '1.6'}}>
            At PilotCenter.net, we're dedicated to guiding you through every stage of your pilot training — from your first medical exam to airline recruitment. No matter which certification path you choose, we connect you with the best flight schools, including accelerated flight schools, online flight school options, and programs that offer flight school scholarships.
          </p>
          <p style={{fontSize: '18px', lineHeight: '1.6', marginTop: '20px'}}>
            By working with trusted flight schools worldwide and helping you understand how much flight school costs, we ensure that financial barriers don't stand in the way of your dream. We'll be with you every step of the way — monitoring your progress and keeping you on track to become a successful airline pilot.
          </p>
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
        <p style={{fontSize: '18px', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto 30px'}}>Becoming a pilot can be a thrilling journey, but it often comes with its fair share of confusion. From understanding the various licensing requirements to navigating the complexities of flight training, it's easy to feel overwhelmed. But don't worry, we're here to help you every step of the way! Let us guide you through the process and turn your dreams of flying into reality.</p>
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

export default FAARoute;