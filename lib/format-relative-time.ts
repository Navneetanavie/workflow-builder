const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < MINUTE) return "Edited just now";
  if (seconds < HOUR) {
    const minutes = Math.floor(seconds / MINUTE);
    return `Edited ${minutes}m ago`;
  }
  if (seconds < DAY) {
    const hours = Math.floor(seconds / HOUR);
    return `Edited ${hours}h ago`;
  }
  if (seconds < WEEK) {
    const days = Math.floor(seconds / DAY);
    return `Edited ${days}d ago`;
  }

  return `Edited ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
}
