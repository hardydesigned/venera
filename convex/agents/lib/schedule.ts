/**
 * Berechnet den nächsten Ausführungszeitpunkt für einen Agenten
 * basierend auf einer vereinfachten Cron-Expression.
 *
 * Unterstützte Formate (aus SCHEDULE_OPTIONS):
 *   "0 9 * * 1"     → nächsten Montag 09:00 UTC
 *   "0 9 * * 1-5"   → nächsten Werktag 09:00 UTC
 *   "0 8 * * *"     → täglich 08:00 UTC
 *   Stunden-Schritt 6 (Cron: 0, dann /6 für die Stunde) → alle 6 Stunden
 */

/** Gibt den nächsten Timestamp (ms) zurück, oder null wenn kein Schedule. */
export function computeNextRunAt(
  schedule: string | undefined,
  fromMs: number = Date.now(),
): number | null {
  if (!schedule || schedule.trim() === "") return null;

  const parts = schedule.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [minutePart, hourPart, , , dowPart] = parts;

  const from = new Date(fromMs);
  // Starte 1 Minute nach dem Referenzzeitpunkt
  const base = new Date(fromMs + 60_000);
  base.setUTCSeconds(0, 0);

  // Alle 6 Stunden: "0 */6 * * *"
  if (hourPart === "*/6") {
    const minute = parseInt(minutePart, 10) || 0;
    const candidate = new Date(base);
    candidate.setUTCMinutes(minute, 0, 0);
    // Runde auf nächste 6h-Grenze (0, 6, 12, 18)
    const nextHour = Math.ceil(base.getUTCHours() / 6) * 6;
    candidate.setUTCHours(nextHour % 24, minute, 0, 0);
    if (nextHour >= 24) {
      candidate.setUTCDate(candidate.getUTCDate() + 1);
      candidate.setUTCHours(0, minute, 0, 0);
    }
    if (candidate.getTime() <= fromMs) {
      candidate.setUTCHours(candidate.getUTCHours() + 6, minute, 0, 0);
    }
    return candidate.getTime();
  }

  const targetHour = parseInt(hourPart, 10);
  const targetMinute = parseInt(minutePart, 10) || 0;

  if (isNaN(targetHour)) return null;

  // Täglich: "0 8 * * *"
  if (dowPart === "*") {
    return nextOccurrenceDaily(fromMs, targetHour, targetMinute);
  }

  // Jeden Montag: "0 9 * * 1"
  if (/^\d$/.test(dowPart)) {
    const targetDow = parseInt(dowPart, 10); // 0=So, 1=Mo, ..., 6=Sa
    return nextOccurrenceDow(fromMs, [targetDow], targetHour, targetMinute);
  }

  // Werktäglich: "0 9 * * 1-5"
  if (dowPart === "1-5") {
    return nextOccurrenceDow(fromMs, [1, 2, 3, 4, 5], targetHour, targetMinute);
  }

  // Fallback: täglich
  return nextOccurrenceDaily(fromMs, targetHour, targetMinute);
}

function nextOccurrenceDaily(
  fromMs: number,
  hour: number,
  minute: number,
): number {
  const d = new Date(fromMs);
  const candidate = new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      hour,
      minute,
      0,
      0,
    ),
  );
  if (candidate.getTime() <= fromMs) {
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }
  return candidate.getTime();
}

function nextOccurrenceDow(
  fromMs: number,
  allowedDows: number[],
  hour: number,
  minute: number,
): number {
  const d = new Date(fromMs);
  let candidate = new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      hour,
      minute,
      0,
      0,
    ),
  );
  // Maximal 7 Tage vorwärts suchen
  for (let i = 0; i <= 7; i++) {
    const dow = candidate.getUTCDay();
    if (allowedDows.includes(dow) && candidate.getTime() > fromMs) {
      return candidate.getTime();
    }
    candidate = new Date(candidate.getTime() + 86_400_000);
  }
  return fromMs + 7 * 86_400_000; // Fallback: in 7 Tagen
}
