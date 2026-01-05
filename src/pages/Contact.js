import React from "react";
import MapWithPins from '../components/MapWithPins';
import './Contact.css';

export default function Contact() {

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="wrapper contact-hero-inner">
          <div className="contact-hero-copy">
            <span style={{color: '#2563eb'}}>Let's talk</span>
            <h1 className="contact-hero-title">Contact</h1>
            <p className="contact-hero-text">
              Have questions or need assistance? We're here to help! Reach out to us
              for personalized guidance and support on your journey to finding the
              perfect flying school.
            </p>

            <div className="contact-hero-highlights">
              <div>
                <strong>3</strong>
                <span>Global offices</span>
              </div>
              <div>
                <strong>24h</strong>
                <span>Response time</span>
              </div>
            </div>
          </div>

          <div className="contact-hero-media">
            <div className="contact-hero-image-frame">
              <img
                src="/images/Airplane Wing_edited_edited.jpg"
                alt="Airplane wing"
              />
            </div>
          </div>
        </div>
      </div>
      <main style={{flex: 1, padding: '40px 0'}}>
        <div className="wrapper">
          <div className="contact-content">
            <div className="contact-text">
              <h2 style={{fontSize: '24px', color: 'var(--title)', marginBottom: '20px'}}>Contact information</h2>
              <div className="text-grid">
                <div className="text-block">
                  <h3>Miami office</h3>
                  <p>14261 SW 120th St<br />
#108-636<br />
Miami, FL 33186<br />
United States</p>
                </div>
                <div className="text-block">
                  <h3>California office</h3>
                  <p>5708 Hollister Ave<br />
Suite A PMB 1020<br />
Goleta, CA 93117<br />
United States</p>
                </div>
                <div className="text-block">
                  <h3>London office</h3>
                  <p>275 New North Road<br />
Islington Suite 1183<br />
London, N1 7AA<br />
United Kingdom</p>
                </div>
                <div className="text-block">
                  <h3>Phone & email</h3>
                  <p>connect@pilotcenter.net<br />
+1 (305) 786 0210​<br />
+1 (305) 786 0211​<br />
+1 (305) 786 0212​<br />
+1 (305) 786 0213</p>
                </div>
              </div>
            </div>
            <div className="contact-form">
            <h2>Get In Touch</h2>
            <form action="https://formspree.io/f/mrbnnryj" method="POST">
              <input type="hidden" name="_subject" value="PilotCenter – Contact Form" />
              <input type="hidden" name="_next" value="https://pilotcenter.net/thank-you" />

              <div className="form-group">
                <label htmlFor="email">Your email:</label>
                <input type="email" id="email" name="email" required />
              </div>

              <div className="form-group">
                <label htmlFor="message">Your message:</label>
                <textarea id="message" name="message" required></textarea>
              </div>

              <button type="submit" className="submit-btn">Send</button>
            </form>
          </div>
          </div>
          <MapWithPins />
        </div>
      </main>
    </div>
  );
}