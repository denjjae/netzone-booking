export function calculatePrice(start: string, duration: number) {
  const [hh, mm] = start.split(":").map(Number);
  let cursor = hh * 60 + mm;
  const end = cursor + duration * 60;
  let total = 0;
  while (cursor < end) {
    const next = Math.min(end, cursor < 17 * 60 ? 17 * 60 : end);
    total += ((next - cursor) / 60) * (cursor < 17 * 60 ? 250 : 300);
    cursor = next;
  }
  return total;
}
export function endTime(start: string, duration: number) {
  const [h,m] = start.split(":").map(Number);
  const mins = h*60+m+duration*60;
  return `${String(Math.floor(mins/60)%24).padStart(2,"0")}:${String(mins%60).padStart(2,"0")}`;
}
