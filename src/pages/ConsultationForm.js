import React from "react";
import { useForm, ValidationError } from "@formspree/react";

function ConsultationForm() {
  const [state, handleSubmit] = useForm("mrbnnryj");

  if (state.succeeded) {
    // Redirect AFTER successful submit
    window.location.href = "/calendar-booking";
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="consultation-form">

      {/* Hidden metadata */}
      <input type="hidden" name="_subject" value="PilotCenter – Consultation Booking" />
      <input type="hidden" name="source" value="Consultation Page" />

      {/* First name */}
      <label htmlFor="firstName">First name *</label>
      <input
        id="firstName"
        type="text"
        name="firstName"
        required
      />

      {/* Last name */}
      <label htmlFor="lastName">Last name *</label>
      <input
        id="lastName"
        type="text"
        name="lastName"
        required
      />

      {/* Email */}
      <label htmlFor="email">Email address *</label>
      <input
        id="email"
        type="email"
        name="email"
        required
      />
      <ValidationError prefix="Email" field="email" errors={state.errors} />

      {/* Phone */}
      <label htmlFor="phone">Phone (optional)</label>
      <input
        id="phone"
        type="tel"
        name="phone"
      />

      {/* Consultation type */}
      <label htmlFor="consultationType">Consultation type *</label>
      <select
        id="consultationType"
        name="consultationType"
        required
        onChange={(e) => localStorage.setItem("consultationType", e.target.value)}
      >
        <option value="">Select a consultation</option>
        <option value="Conversion Guidance – FAA / EASA">Conversion Guidance – FAA / EASA</option>
        <option value="Career Guidance for Pilots">Career Guidance for Pilots</option>
        <option value="Pilot Roadmap Service">Pilot Roadmap Service</option>
        <option value="Airline Preparation Consultation">Airline Preparation Consultation</option>
      </select>

      {/* Message */}
      <label htmlFor="message">Notes or questions *</label>
      <textarea
        id="message"
        name="message"
        rows="5"
        required
        placeholder="Please provide as much detail as possible so we can prepare the most effective consultation."
      />
      <ValidationError prefix="Message" field="message" errors={state.errors} />

      {/* Submit */}
      <button type="submit" disabled={state.submitting}>
        {state.submitting ? "Sending…" : "Continue to booking"}
      </button>

    </form>
  );
}

export default ConsultationForm;