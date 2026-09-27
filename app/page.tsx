"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const hours = Array.from({ length: 19 }, (_, i) => i + 6);

function timeLabel(hour: number) {
  if (hour === 24) return "12:00 AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${hour < 12 ? "AM" : "PM"}`;
}

function timeValue(hour: number) {
  return `${String(hour % 24).padStart(2, "0")}:00`;
}

function rate(hour: number) {
  return hour >= 17 ? 300 : 250;
}

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [court, setCourt] = useState("Court A");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const startHour = Number(start);
  const endHour = Number(end);

  const total =
    start && end && endHour > startHour
      ? Array.from(
          { length: endHour - startHour },
          (_, i) => rate(startHour + i)
        ).reduce((a, b) => a + b, 0)
      : 0;

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!start || !end || endHour <= startHour) {
      setMessage("Please select a valid booking time.");
      return;
    }

    setLoading(true);

    try {
      const { data: existing, error: checkError } = await supabase
        .from("bookings")
        .select("start_time,end_time")
        .eq("court", court)
        .eq("booking_date", date)
        .neq("booking_status", "CANCELLED");

      if (checkError) throw checkError;

      const overlaps = (existing || []).some((booking) => {
        const oldStart = Number(booking.start_time.slice(0, 2));
        const oldEnd = Number(booking.end_time.slice(0, 2));
        return startHour < oldEnd && endHour > oldStart;
      });

      if (overlaps) {
        setMessage("Sorry, this time slot is already booked. Please choose another.");
        setLoading(false);
        return;
      }

      const reference =
        "NZ-" + Date.now().toString().slice(-8);

      const { error } = await supabase.from("bookings").insert({
        reference,
        customer_name: name,
        phone,
        court,
        booking_date: date,
        start_time: timeValue(startHour),
        end_time: timeValue(endHour),
        total_amount: total,
        booking_status: "PENDING",
        payment_status: "PENDING_VERIFICATION",
      });

      if (error) throw error;

      setMessage(
        `Booking request submitted! Reference: ${reference}. Total: ₱${total}. Please wait for confirmation.`
      );
      setName("");
      setPhone("");
      setCourt("Court A");
      setDate("");
      setStart("");
      setEnd("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 24, color: "#172554" }}>
      <header style={{ textAlign: "center", padding: "24px 0" }}>
        <h1 style={{ fontSize: 42, margin: 0 }}>
          <span style={{ color: "#ec4899" }}>Net</span>
          <span style={{ color: "#2563eb" }}>Zone</span>
        </h1>
        <p>Book your court. Play your game.</p>
        <p style={{ fontSize: 14 }}>
          Barangay Apopong Diversion Road, General Santos City
        </p>
      </header>

      <section style={{ background: "#f8fafc", borderRadius: 16, padding: 24 }}>
        <h2>Book a Court</h2>
        <p>Choose your court, date, and playing time.</p>

        <form onSubmit={submitBooking}>
          <label>Court</label>
          <select
            value={court}
            onChange={(e) => setCourt(e.target.value)}
            style={fieldStyle}
          >
            <option>Court A</option>
            <option>Court B</option>
          </select>

          <label>Booking Date</label>
          <input
            type="date"
            value={date}
            min={new Date().toLocaleDateString("en-CA")}
            onChange={(e) => setDate(e.target.value)}
            required
            style={fieldStyle}
          />

          <label>Start Time</label>
          <select
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              setEnd("");
            }}
            required
            style={fieldStyle}
          >
            <option value="">Select start time</option>
            {hours.slice(0, 18).map((hour) => (
              <option key={hour} value={hour}>
                {timeLabel(hour)}
              </option>
            ))}
          </select>

          <label>End Time</label>
          <select
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
            disabled={!start}
            style={fieldStyle}
          >
            <option value="">Select end time</option>
            {hours
              .filter((hour) => hour > startHour)
              .concat(startHour < 24 ? [24] : [])
              .map((hour) => (
                <option key={hour} value={hour}>
                  {timeLabel(hour)}
                </option>
              ))}
          </select>

          <label>Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your full name"
            style={fieldStyle}
          />

          <label>Contact Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="09XXXXXXXXX"
            style={fieldStyle}
          />

          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 12,
              margin: "20px 0",
            }}
          >
            <p>6:00 AM – 5:00 PM: ₱250/hour</p>
            <p>5:00 PM – 12:00 AM: ₱300/hour</p>
            <h2>Total: ₱{total.toLocaleString()}</h2>
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Submitting..." : "Submit Booking"}
          </button>
        </form>

        {message && (
          <p
            style={{
              background: "white",
              padding: 16,
              borderRadius: 8,
              overflowWrap: "anywhere",
            }}
          >
            {message}
          </p>
        )}
      </section>

      <footer style={{ textAlign: "center", padding: 24 }}>
        <a href="/admin" style={{ color: "#64748b" }}>
          Admin Login
        </a>
      </footer>
    </main>
  );
}

const fieldStyle = {
  display: "block",
  width: "100%",
  padding: 12,
  margin: "8px 0 18px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "white",
  boxSizing: "border-box" as const,
};

const buttonStyle = {
  width: "100%",
  padding: 16,
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontSize: 16,
  fontWeight: "bold" as const,
  cursor: "pointer",
};
