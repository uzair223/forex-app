import { utcFormat } from "d3";

export function time(d: number | Date, tz: number, format: string): string;
export function time(d: number | Date, tz: number, format?: undefined): Date;
export function time(d: number | Date, tz: number, format?: string) {
  const dt = new Date(+d + tz * 3_600_000);
  return format ? utcFormat(format)(dt) : dt;
}

export function isWeekend() {
  const utcnow = new Date();
  const day = utcnow.getUTCDay();
  const hour = utcnow.getUTCHours();
  return (day === 5 && hour >= 21) || day == 6 || (day == 0 && hour < 21);
}

export function minutesTo(hour: number, tz: number) {
  const monday = {
    5: 3, // fri
    6: 2, // sat
    0: 1, // sun
    1: 0, // mon
  };
  const now = time(Date.now(), tz);
  const next = new Date();
  next.setUTCHours(hour, 0, 0, 0);
  next.setUTCDate(now.getUTCDate() + (now.getUTCHours() < hour ? 0 : 1));
  if (isWeekend()) {
    next.setUTCDate(now.getUTCDate() + monday[now.getUTCDay() as 5 | 6 | 0 | 1]);
  }
  let m = (+next - +now) / 60_000;
  if (m < 0) m = 24 * 60_000 + m;
  return m;
}
