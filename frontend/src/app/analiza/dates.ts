const RO_MONTHS_SHORT = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];

/**
 * Formatează un "yyyy-MM" (din `SpendingTimelinePoint.month`) într-o etichetă scurtă RO pt. axa
 * graficului „Evoluția Cheltuielilor" — include anul doar dacă diferă de anul curent.
 */
export function formatMonthLabel(month: string): string {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const label = RO_MONTHS_SHORT[Number(monthStr) - 1] ?? monthStr;
  const currentYear = new Date().getFullYear();
  return year === currentYear ? label : `${label} ${year}`;
}
