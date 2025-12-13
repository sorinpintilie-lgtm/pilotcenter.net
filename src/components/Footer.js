import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" id="contact">
      <div className="wrapper">
        <div className="footer-grid">
          {/* Row 1: Links (single column on mobile) */}
          <div className="footer-row footer-row-1">
            <div className="footer-col">
              <h4>Links</h4>
              <ul>
                <li><a href="/faq">FAQ</a></li>
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/routes">How to Become a Pilot Routes</a></li>
                <li><a href="/countries">How to Become a Pilot In Different Countries</a></li>
              </ul>
            </div>
          </div>

          {/* Row 2: Miami and California Offices (side by side on mobile) */}
          <div className="footer-row footer-row-2">
            <div className="footer-col">
              <h4>Miami Office</h4>
              <p>PilotCenter.net</p>
              <p>14261 SW 120th St</p>
              <p>#108-636</p>
              <p>Miami, FL 33186</p>
              <p>United States</p>
            </div>
            <div className="footer-col">
              <h4>California Office</h4>
              <p>PilotCenter.net</p>
              <p>5708 Hollister Ave</p>
              <p>Suite A PMB 1020</p>
              <p>Goleta, CA 93117</p>
              <p>United States</p>
            </div>
          </div>

          {/* Row 3: London Office and Contact Numbers (side by side on mobile) */}
          <div className="footer-row footer-row-3">
            <div className="footer-col">
              <h4>London Office</h4>
              <p>PilotCenter.net</p>
              <p>275 New North Road Islington</p>
              <p>Suite 1183</p>
              <p>London, N1 7AA</p>
              <p>United Kingdom</p>
            </div>
            <div className="footer-col">
              <h4>Contact Numbers</h4>
              <p>+1 (305) 786 0210</p>
              <p>+1 (305) 786 0211</p>
              <p>+1 (305) 786 0212</p>
              <p>+1 (305) 786 0213</p>
            </div>
          </div>
        </div>

        {/* Copyright and Powered By */}
        <div className="footer-legal">
          <p>© {currentYear} PilotCenter.net • All rights reserved</p>
          <p>Powered by
            <a href="https://visualmarketing.ro" target="_blank" rel="noopener noreferrer">
              <img src="/images/visualMarketing_logo.png" alt="Visual Marketing" style={{height: '20px', width: 'auto', verticalAlign: 'middle'}} />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;