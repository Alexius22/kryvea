const utcDate = new Intl.DateTimeFormat(undefined, {
  timeZone: "UTC",
});

// Format date to the user's locale
export function formatDate(dateString: string) {
  return utcDate.format(new Date(dateString));
}

const utcDateTime = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  timeZone: "UTC",
});

export function formatDateTime(dateString: string) {
  return utcDateTime.format(new Date(dateString));
}
