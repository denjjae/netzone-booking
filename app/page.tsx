"use client";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calculatePrice, endTime } from "@/lib/pricing";

export default function Home() {
  const today = new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  const [date,setDate]=useState(today), [court,setCourt]=useState("Court A"), [start,setStart]=useState("09:00"),
    [duration,setDuration]=useState("1"), [name,setName]=useState(""), [phone,setPhone]=useState(""),
    [email,setEmail]=useState(""), [notes,setNotes]=useState(""), [proof,setProof]=useState<File|null>(null),
    [busy,setBusy]=useState(false), [message,setMessage]=useState(""), [error,setError]=useState("");
  const total=useMemo(()=>calculatePrice(start,Number(duration)),[start,duration]);
  const end=endTime(start,Number(duration));
  const [qrUrl,setQrUrl]=useState("");
  async function submit(e:React.FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if(!proof){setError("Please upload your payment screenshot.");return;}
    if(!name.trim()||!phone.trim()){setError("Please enter your name and mobile number.");return;}
    setBusy(true);
    try {
      const ext=proof.name.split(".").pop() || "jpg";
      const path=`${crypto.randomUUID()}.${ext}`;
      const {error:upErr}=await supabase.storage.from("payment-proofs").upload(path,proof,{upsert:false,contentType:proof.type});
      if(upErr) throw upErr;
      const {data,error:dbErr}=await supabase.from("bookings").insert({
        customer_name:name.trim(), phone:phone.trim(), email:email.trim()||null, court, booking_date:date,
        start_time:start, end_time:end, duration_hours:Number(duration), total_amount:total,
        payment_method:"QR_TRANSFER", payment_status:"PENDING_VERIFICATION", booking_status:"PENDING",
        payment_proof_path:path, notes:notes.trim()||null
      }).select("reference").single();
      if(dbErr) throw dbErr;
      setMessage(`Booking request saved! Reference: ${data.reference}. Your payment is pending owner verification.`);
      setName("");setPhone("");setEmail("");setNotes("");setProof(null);
    } catch(err:any) { setError(err?.message || "Could not submit booking. Please try again."); }
    finally {setBusy(false);}
  }
  return <main className="wrap">
    <nav className="nav"><div className="logo"><span className="net">Net</span><span className="zone">Zone</span> 🏓</div><a className="pill" href="#book">Book a Court</a></nav>
    <section className="hero"><div><div className="tag">PICKLEBALL COURT RENTAL · GENERAL SANTOS CITY</div><h1>Your next pickleball game starts here.</h1><p>Grab your friends, pick a time, and get on court at NetZone.</p><a className="pill" href="#book">Book a Court →</a></div><div className="card"><h2>Play at NetZone</h2><p>📍 Barangay Apopong, Diversion Road<br/>(Beside Cabin Brewery), General Santos City</p><p>🕕 Open daily · 6:00 AM–12:00 AM</p><div className="rates"><div className="rate">6 AM – 5 PM<strong>₱250<span style={{fontSize:14}}>/hr</span></strong></div><div className="rate">5 PM – 12 AM<strong>₱300<span style={{fontSize:14}}>/hr</span></strong></div></div></div></section>
    <section className="section grid"><div className="card"><h2>How to book</h2><p>1. Choose a court, date, and time.</p><p>2. Enter your details and upload your payment proof.</p><p>3. Wait for the owner to verify your payment and booking.</p></div><div className="card"><h2>Payment</h2><p>Pay through the official GCash or bank-transfer QR code. Your booking stays pending until the owner verifies the payment.</p><p className="note">Owner: add your official QR code in the app before accepting real bookings.</p></div></section>
    <section className="section card" id="book"><h2>Book a court</h2><p className="note">Bookings are requests until confirmed by the owner. Availability and overlap protection must be enabled in the database before launch.</p>
      <form onSubmit={submit}><div className="formgrid">
        <div className="field"><label>Booking date</label><input type="date" min={today} value={date} onChange={e=>setDate(e.target.value)} required/></div>
        <div className="field"><label>Court</label><select value={court} onChange={e=>setCourt(e.target.value)}><option>Court A</option><option>Court B</option></select></div>
        <div className="field"><label>Start time</label><select value={start} onChange={e=>setStart(e.target.value)}>{Array.from({length:18},(_,i)=>6+i).map(h=><option key={h} value={`${String(h).padStart(2,"0")}:00`}>{h===12?"12:00 PM":h<12?`${h}:00 AM`:`${h-12}:00 PM`}</option>)}</select></div>
        <div className="field"><label>Duration</label><select value={duration} onChange={e=>setDuration(e.target.value)}>{[1,2,3,4].filter(d=>Number(start.slice(0,2))+d<=24).map(d=><option key={d} value={d}>{d} hour{d>1?"s":""}</option>)}</select></div>
        <div className="field"><label>Full name *</label><input value={name} onChange={e=>setName(e.target.value)} required placeholder="Your full name"/></div>
        <div className="field"><label>Mobile number *</label><input value={phone} onChange={e=>setPhone(e.target.value)} required placeholder="09XX XXX XXXX"/></div>
        <div className="field"><label>Email (optional)</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>
        <div className="field"><label>Payment screenshot *</label><input type="file" accept="image/*,.pdf" onChange={e=>setProof(e.target.files?.[0]||null)} required/></div>
        <div className="field full"><label>Notes (optional)</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Anything we should know?"/></div>
      </div><div className="notice"><strong>Estimated total: ₱{total.toLocaleString("en-PH")}</strong><br/><span className="note">{start}–{end} · {duration} hour(s) · {court}</span></div>
      <div className="field" style={{marginTop:16}}><label>Payment QR code</label>{qrUrl?<img src={qrUrl} alt="NetZone payment QR" style={{maxWidth:220,width:"100%"}}/>:<p className="note">Payment QR code has not been configured yet. Add your official QR code before publishing.</p>}</div>
      <button className="submit" disabled={busy} type="submit">{busy?"Submitting…":"Submit Booking Request"}</button>
      {message&&<div className="notice">{message}</div>}{error&&<div className="error">{error}</div>}
      </form></section>
    <footer>© {new Date().getFullYear()} NetZone · Pickleball, good games, good company.</footer>
  </main>;
}
