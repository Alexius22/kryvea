// Format date to the user's locale
export function formatDate(dateString: string) {
  if (!dateString) return "";
  return new Intl.DateTimeFormat().format(new Date(dateString)).toString();
}
