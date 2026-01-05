import React, { useMemo, useState } from "react";
import "./ConsultationBooking.css";
import ConsultationForm from "./ConsultationForm";

const CONSULTATIONS = [
  {
    id: "conversion-guidance",
    title: "Conversion Guidance",
    price: 35,
    unit: "USD / hour",
    short:
      "FAA ↔ EASA conversion guidance with experienced specialists worldwide.",
    full:
      "Get full guidance and advice from experienced specialists worldwide on FAA and EASA license conversions. We’ll help you understand requirements, common pitfalls, timelines, and the most efficient next steps based on your current license and goals.",
  },
  {
    id: "career-guidance",
    title: "Career Guidance for Pilots",
    price: 25,
    unit: "USD / hour",
    short:
      "1:1 session to choose the best training path and maximize airline recruitment chances.",
    full:
      "One-on-one consultation to help pilots choose the best training path — FAA (cheaper and faster) or EASA (recognized in Europe). Includes personalized advice on maximizing your chances for airline recruitment, planning milestones, and avoiding costly mistakes.",
  },
  {
    id: "pilot-roadmap",
    title: "Pilot Roadmap Service",
    price: 25,
    unit: "USD / hour",
    short:
      "Personalized training roadmap: affordable, fast, and career-focused — from medical to school choice.",
    full:
      "Receive your personalized pilot training roadmap — with the most affordable, fastest, and career-focused path to your license. Includes expert advice on medical examinations, key factors to consider when choosing a flight school, and what to expect throughout your training journey.",
  },
  {
    id: "airline-prep",
    title: "Airline Preparation Consultation",
    price: 40,
    unit: "USD / hour",
    short:
      "Focused session for airline recruitment, simulator prep, and interview readiness.",
    full:
      "Focused session on airline recruitment preparation, simulator briefings, and interview readiness. We’ll help you understand what airlines look for, how to prepare efficiently, and how to present your experience confidently.",
    optional: true,
  },
];

export default function ConsultationBooking() {
  const [selectedId, setSelectedId] = useState(CONSULTATIONS[0].id);
  const [showForm, setShowForm] = useState(false);

  const selected = useMemo(
    () => CONSULTATIONS.find((c) => c.id === selectedId),
    [selectedId]
  );

  function onPick(id) {
    setSelectedId(id);
    setShowForm(false);
    // scroll to details on mobile nicely (only on mobile)
    if (window.innerWidth < 900) {
      const el = document.getElementById("consultation-details");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function onBookClick() {
    setShowForm(true);
    const el = document.getElementById("consultation-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="cb-page">
      {/* HERO */}
      <section className="cb-hero">
        <div className="cb-wrapper">
          <div className="cb-heroGrid">
            <div className="cb-heroCopy">
              <div className="cb-kicker">EXPERT ADVICE</div>
              <h1 className="cb-title">Consultation Booking</h1>
              <p className="cb-subtitle">
                Choose a consultation type, see the full details and price, then
                book your session. Mobile-friendly, simple, and fast.
              </p>

              <div className="cb-badges">
                <span className="cb-badge">1 hour sessions</span>
                <span className="cb-badge">Secure payment (coming next)</span>
              </div>
            </div>

            <div className="cb-heroCard">
              <div className="cb-heroCardTop">
                <div className="cb-heroCardTitle">How it works</div>
                <div className="cb-heroCardSteps">
                  <div className="cb-step">
                    <span className="cb-stepNum">1</span>
                    <span>Pick a consultation</span>
                  </div>
                  <div className="cb-step">
                    <span className="cb-stepNum">2</span>
                    <span>Read details & price</span>
                  </div>
                  <div className="cb-step">
                    <span className="cb-stepNum">3</span>
                    <span>Book & pay to confirm</span>
                  </div>
                </div>
              </div>

              <div className="cb-heroCardNote">
                During weekdays, availability will be set manually by the admin.
                For now, default availability is weekends (10:00–18:00).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="cb-main">
        <div className="cb-wrapper cb-mainGrid">
          {/* LEFT: list */}
          <aside className="cb-list">
            <h2 className="cb-sectionTitle">Choose a consultation</h2>
            <p className="cb-sectionHint">
              Tap a card to see the full description and price.
            </p>

            <div className="cb-cards">
              {CONSULTATIONS.map((c) => {
                const active = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    className={`cb-card ${active ? "is-active" : ""}`}
                    onClick={() => onPick(c.id)}
                    type="button"
                    aria-pressed={active}
                  >
                    <div className="cb-cardTop">
                      <div className="cb-cardTitle">
                        {c.title}
                        {c.optional ? (
                          <span className="cb-tag">Optional</span>
                        ) : null}
                      </div>
                      <div className="cb-price">
                        <span className="cb-priceNum">${c.price}</span>
                        <span className="cb-priceUnit">{c.unit}</span>
                      </div>
                    </div>
                    <div className="cb-cardShort">{c.short}</div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* RIGHT: details + form */}
          <div className="cb-panel">
            <div className="cb-panelInner" id="consultation-details">
              <div className="cb-panelHeader">
                <div>
                  <div className="cb-panelKicker">Selected consultation</div>
                  <h2 className="cb-panelTitle">{selected.title}</h2>
                </div>

                <div className="cb-panelPrice">
                  <div className="cb-panelPriceNum">${selected.price}</div>
                  <div className="cb-panelPriceUnit">{selected.unit}</div>
                </div>
              </div>

              <p className="cb-panelText">{selected.full}</p>

              <div className="cb-panelActions">
                <button className="cb-btn cb-btnPrimary" onClick={onBookClick}>
                  Book Consultation
                </button>
                <div className="cb-panelFineprint">
                  You’ll fill a short form first. Next step is calendar booking +
                  payment.
                </div>
              </div>
            </div>

            {/* FORM */}
            {showForm && (
              <div className="cb-formWrap" id="consultation-form">
                <div className="cb-formHeader">
                  <h3 className="cb-formTitle">Registration</h3>
                  <p className="cb-formHint">
                    Consultation Topic / Type is auto-filled based on your
                    selection.
                  </p>
                </div>

                <ConsultationForm />

                <div className="cb-formFooter">
                  <div className="cb-formSmall">
                    After this step, you’ll be redirected to calendar booking,
                    then payment (coming next).
                  </div>
                </div>
              </div>
            )}

            {/* OPTIONAL: FAQ */}
            <div className="cb-faq">
              <h3 className="cb-faqTitle">Quick answers</h3>
              <div className="cb-faqGrid">
                <div className="cb-faqItem">
                  <div className="cb-faqQ">When can I book?</div>
                  <div className="cb-faqA">
                    Default availability is weekends (10:00–18:00).
                    Weekdays will be added manually.
                  </div>
                </div>
                <div className="cb-faqItem">
                  <div className="cb-faqQ">How long is a session?</div>
                  <div className="cb-faqA">
                    Each consultation is 1 hour per booking.
                  </div>
                </div>
                <div className="cb-faqItem">
                  <div className="cb-faqQ">Do I pay before it’s confirmed?</div>
                  <div className="cb-faqA">
                    Yes — payment happens before final confirmation (next step
                    once integrated).
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /panel */}
        </div>
      </section>
    </div>
  );
}