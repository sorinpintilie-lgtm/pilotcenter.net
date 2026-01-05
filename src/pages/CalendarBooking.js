import React, { useMemo, useState } from "react";
import "./CalendarBooking.css";

// Prague time as requested
const TZ = "Europe/Prague";

// Helpers
function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDateKey(d) {
  // YYYY-MM-DD in local device time (OK for display grouping)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isWeekend(date) {
  const day = date.getDay(); // 0 Sun, 6 Sat
  return day === 0 || day === 6;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Build default slots: Sat+Sun, 10:00–18:00, 1 hour
function buildDefaultSlots(daysAhead = 21) {
  const now = new Date();
  const slots = [];

  for (let i = 0; i <= daysAhead; i++) {
    const d = addDays(now, i);
    if (!isWeekend(d)) continue;

    // create 10:00..17:00 start slots (10-11 ... 17-18)
    for (let hour = 10; hour <= 17; hour++) {
      const slotId = `${formatDateKey(d)}_${pad(hour)}:00`;
      slots.push({
        id: slotId,
        dateKey: formatDateKey(d),
        time: `${pad(hour)}:00`,
        label: `${formatDateKey(d)} at ${pad(hour)}:00 (${TZ})`,
      });
    }
  }

  return slots;
}

export default function CalendarBooking() {
  // load chosen consultation + form data from localStorage (if you saved it)
  // If not saved yet, this page still works.
  const consultationType =
    localStorage.getItem("consultationType") || "Consultation";

  const [selectedSlotId, setSelectedSlotId] = useState(
    localStorage.getItem("selectedSlotId") || ""
  );

  const slots = useMemo(() => buildDefaultSlots(21), []);
  const grouped = useMemo(() => {
    const map = {};
    for (const s of slots) {
      map[s.dateKey] = map[s.dateKey] || [];
      map[s.dateKey].push(s);
    }
    return map;
  }, [slots]);

  function chooseSlot(id) {
    setSelectedSlotId(id);
    localStorage.setItem("selectedSlotId", id);
  }

  function continueNext() {
    if (!selectedSlotId) return;

    // Next step later could be: /payment
    // For now we’ll confirm selection and go to a placeholder page
    window.location.href = "/booking-summary";
  }

  return (
    <div className="cbk-page">
      <section className="cbk-hero">
        <div className="wrapper">
          <div className="cbk-kicker">STEP 2</div>
          <h1 className="cbk-title">Choose a time slot</h1>
          <p className="cbk-subtitle">
            Available by default: <strong>Saturdays & Sundays</strong>, 
            <strong>10:00–18:00</strong> ({TZ}). Each slot is 1 hour.
          </p>

          <div className="cbk-pillRow">
            <span className="cbk-pill">Selected service: {consultationType}</span>
            <span className="cbk-pill">Timezone: {TZ}</span>
          </div>
        </div>
      </section>

      <section className="cbk-main">
        <div className="wrapper cbk-grid">
          <div className="cbk-calendar">
            {Object.keys(grouped).length === 0 && (
              <div className="cbk-empty">No slots found.</div>
            )}

            {Object.entries(grouped).map(([dateKey, daySlots]) => (
              <div className="cbk-day" key={dateKey}>
                <div className="cbk-dayHeader">
                  <div className="cbk-dayTitle">{dateKey}</div>
                  <div className="cbk-dayNote">({TZ})</div>
                </div>

                <div className="cbk-slots">
                  {daySlots.map((s) => {
                    const active = selectedSlotId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`cbk-slot ${active ? "is-active" : ""}`}
                        onClick={() => chooseSlot(s.id)}
                        aria-pressed={active}
                      >
                        {s.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="cbk-summary">
            <div className="cbk-card">
              <div className="cbk-cardTitle">Your selection</div>

              <div className="cbk-row">
                <span>Consultation</span>
                <strong>{consultationType}</strong>
              </div>

              <div className="cbk-row">
                <span>Time slot</span>
                <strong>{selectedSlotId || "Not selected"}</strong>
              </div>

              <div className="cbk-divider" />

              <button
                className="cbk-btn"
                type="button"
                disabled={!selectedSlotId}
                onClick={continueNext}
              >
                Continue
              </button>

              <div className="cbk-fine">
                Next step: booking summary (then payment/confirmation once
                implemented).
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}