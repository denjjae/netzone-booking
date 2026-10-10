const { error } = await supabase.from("bookings").insert({
  reference,
  customer_name: name,
  phone,
  court,
  booking_date: date,
  start_time: timeValue(startHour),
  end_time: timeValue(endHour),
  duration_hours: endHour - startHour,
  payment_proof_path: "PENDING",
  total_amount: total,
  booking_status: "PENDING",
  payment_status: "PENDING_VERIFICATION",
});
