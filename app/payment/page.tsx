"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Booking = {
  reference: string;
  customer_name: string;
  phone: string;
  court: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_amount: number;
  booking_status: string;
  payment_status: string;
};

function formatTime(value: string) {
  const hour = Number(value.slice(0, 2));
  const minute = value.slice(3, 5);
  const h = hour % 12 || 12;

  return `${h}:${minute} ${hour < 12 ? "AM" : "PM"}`;
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function PaymentPage() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState("Loading your booking...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get("reference");

      if (!reference) {
        setMessage("Booking reference is missing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(
          "reference,customer_name,phone,court,booking_date,start_time,end_time,duration_hours,total_amount,booking_status,payment_status"
        )
        .eq("reference", reference)
        .single();

      if (error || !data) {
        console.error("PAYMENT PAGE ERROR:", error);
        setMessage("We couldn't find your booking.");
        setLoading(false);
        return;
      }

      setBooking(data);
      setLoading(false);
    }

    loadBooking();
  }, []);

  if (loading) {
    return (
      <main style={pageStyle}>
        <p>{message}</p>
      </main>
    );
  }

  if (!booking) {
    return (
      <main style={pageStyle}>
        <h1>NetZone</h1>
        <p>{message}</p>

        <a href="/" style={linkStyle}>
          Back to Booking
        </a>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <header style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 40, margin: 0 }}>
            <span style={{ color: "#ec4899" }}>Net</span>
            <span style={{ color: "#2563eb" }}>Zone</span>
          </h1>

          <h2 style={{ marginBottom: 6 }}>
            Booking Reserved! 🎉
          </h2>

          <p style={{ color: "#64748b", marginTop: 0 }}>
            Please complete your payment to submit your booking for
            verification.
          </p>
        </header>

        <div style={detailsStyle}>
          <p>
            <strong>Reference:</strong> {booking.reference}
          </p>

          <p>
            <strong>Court:</strong> {booking.court}
          </p>

          <p>
            <strong>Date:</strong> {formatDate(booking.booking_date)}
          </p>

          <p>
            <strong>Time:</strong> {formatTime(booking.start_time)} –{" "}
            {formatTime(booking.end_time)}
          </p>

          <p>
            <strong>Name:</strong> {booking.customer_name}
          </p>

          <h2 style={{ textAlign: "center", marginBottom: 0 }}>
            Total: ₱{Number(booking.total_amount).toLocaleString()}
          </h2>
        </div>

        <h2 style={{ textAlign: "center" }}>
          Choose a Payment Method
        </h2>

        <section style={paymentCardStyle}>
          <h3>LandBank / InstaPay</h3>

          <p>
            Scan the QR code and pay the exact amount shown above.
          </p>

          <img
            src="/landbank-qr.jpeg"
            alt="LandBank InstaPay QR Code"
            style={qrStyle}
          />
        </section>

        <section style={paymentCardStyle}>
          <h3>GCash</h3>

          <p>
            Scan the QR code and pay the exact amount shown above.
          </p>

          <img
            src="/gcash-qr.jpeg"
            alt="GCash QR Code"
            style={qrStyle}
          />
        </section>

        <div style={noticeStyle}>
          <strong>Important:</strong>

          <p style={{ marginBottom: 0 }}>
            Please pay the exact amount of ₱
            {Number(booking.total_amount).toLocaleString()} and keep
            your successful payment screenshot. You will upload it
            here for verification.
          </p>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 24,
          }}
        >
          <p>
            <strong>
              Payment screenshot upload is the next step.
            </strong>
          </p>

          <p style={{ color: "#64748b" }}>
            We will add the upload button here next so the owner can
            verify your payment.
          </p>
        </div>

        <a href="/" style={linkStyle}>
          ← Back to Booking
        </a>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f1f5f9",
  padding: 24,
  boxSizing: "border-box" as const,
  color: "#172554",
};

const cardStyle = {
  maxWidth: 760,
  margin: "0 auto",
  background: "white",
  borderRadius: 18,
  padding: 24,
  boxSizing: "border-box" as const,
};

const detailsStyle = {
  background: "#f8fafc",
  borderRadius: 14,
  padding: 18,
  margin: "24px 0",
};

const paymentCardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 18,
  margin: "16px 0",
  textAlign: "center" as const,
};

const qrStyle = {
  width: "100%",
  maxWidth: 420,
  display: "block",
  margin: "16px auto 0",
  borderRadius: 10,
};

const noticeStyle = {
  background: "#eff6ff",
  borderRadius: 12,
  padding: 16,
  marginTop: 20,
};

const linkStyle = {
  display: "block",
  textAlign: "center" as const,
  marginTop: 24,
  color: "#2563eb",
  fontWeight: "bold" as const,
  textDecoration: "none",
};
