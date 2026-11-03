/**
 * Generates an array of date strings between check-in and check-out (excluding check-out day).
 */
export function getStayDates(checkIn: string, checkOut: string): string[] {
  const dates: string[] = [];
  const current = new Date(checkIn + "T00:00:00Z");
  const end = new Date(checkOut + "T00:00:00Z");

  if (current >= end) {
    throw new Error("Check-out date must be after check-in date");
  }

  while (current < end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}
