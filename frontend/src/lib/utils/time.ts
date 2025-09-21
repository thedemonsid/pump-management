// Function to show the time in the am pm format
export function formatTimeToAMPM(timeString: string): string {
  if (!timeString) return '';

  // Parse the time string (HH:MM:SS format)
  const [hours, minutes] = timeString.split(':').map(Number);

  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
