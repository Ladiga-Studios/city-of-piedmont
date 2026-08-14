// City Hall hours, computed live in Piedmont's timezone (America/Chicago).
// One source of truth - used by the utility top bar and the homepage
// "Today in Piedmont" panel. Update HOURS here if City Hall's schedule changes.

const TZ = 'America/Chicago';

// Minutes-from-midnight open/close per weekday (0 = Sunday … 6 = Saturday).
// Mon–Fri 8:00 AM – 5:00 PM · closed weekends. (Confirmed at the
// August 2026 walkthrough with City Hall staff.)
const HOURS = {
  1: [480, 1020], // Mon 8:00–17:00
  2: [480, 1020],
  3: [480, 1020],
  4: [480, 1020],
  5: [480, 1020], // Fri 8:00–17:00
};

const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function nowInPiedmont() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const day = DAY_INDEX[get('weekday')] ?? 0;
  const hour = parseInt(get('hour'), 10) % 24; // "24" can appear for midnight
  const minute = parseInt(get('minute'), 10);
  return { day, minutes: hour * 60 + minute };
}

function fmt(mins) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h = h24 % 12 || 12;
  return m === 0 ? `${h} ${ampm}` : `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns the live City Hall status:
 * { open: boolean, label: string, detail: string }
 * e.g. { open: true,  label: 'City Hall is open',   detail: 'Closes 4:30 PM' }
 *      { open: false, label: 'City Hall is closed', detail: 'Opens Monday 8 AM' }
 */
export function cityHallStatus() {
  const { day, minutes } = nowInPiedmont();
  const today = HOURS[day];

  if (today && minutes >= today[0] && minutes < today[1]) {
    return { open: true, label: 'City Hall is open', detail: `Closes ${fmt(today[1])}` };
  }

  // Find the next opening (today later, or scan forward up to a week).
  if (today && minutes < today[0]) {
    return { open: false, label: 'City Hall is closed', detail: `Opens today ${fmt(today[0])}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (HOURS[d]) {
      const dayWord = i === 1 ? 'tomorrow' : DAY_NAMES[d];
      return { open: false, label: 'City Hall is closed', detail: `Opens ${dayWord} ${fmt(HOURS[d][0])}` };
    }
  }
  return { open: false, label: 'City Hall is closed', detail: '' };
}
