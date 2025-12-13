import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section className="new-hero" id="about">
      <div className="new-hero-container">
        <div className="new-hero-content">
          <div className="new-hero-kicker">OUR STORY</div>

          <h1 className="new-hero-title">
            Turning the Dream of Flight into Reality
          </h1>

          <p className="new-hero-subtitle">
            At PilotCenter.net, we understand that becoming a pilot is more than just a dream — it’s a life-changing commitment. From navigating flight school cost to choosing the best flight schools for your goals, the journey can feel overwhelming without expert support. That’s why we created our platform: to simplify the process of becoming a pilot by offering clear guidance, personalized support, and access to top flight schools worldwide. Whether you're just starting out or exploring flight school scholarships, we’re here to help every step of the way.
          </p>

          <p className="new-hero-additional">
            Our journey began when a team of passionate pilots and aviation enthusiasts — all of whom had personally navigated the challenges of flight school — recognized a major gap in the industry. Aspiring pilots were overwhelmed by countless training options, struggling to understand flight school cost, compare programs, or find trustworthy advice. Without access to clear, personalized guidance, too many future aviators felt lost in a sea of conflicting information. PilotCenter.net was created to change that.
          </p>

          <p className="new-hero-additional">
            Determined to make a real difference, we set out to create a service that delivers clarity, expert advice, and continuous support throughout your aviation journey. What sets PilotCenter.net apart? We're built by current airline pilots who vividly remember the confusion of navigating flight school options, understanding how much flight school costs, and finding the right path forward. We’ve turned that experience into a solution designed to guide you — from exploring the best flight schools to accessing flight school scholarships — so you're never alone on your path to becoming a professional pilot.
          </p>
        </div>

        <div className="new-hero-image-container">
          <img src="/images/dreamstime_xxl_76484799_edited (1).avif" alt="Pilot training" className="new-hero-image" />
          <div className="new-hero-image-overlay"></div>
        </div>
      </div>
    </section>
  );
}

export default Hero;