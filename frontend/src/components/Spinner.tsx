/**
 * Spinner inline pentru butoane și ecrane de încărcare. Culoarea vine din `currentColor` (border-current),
 * nu e hardcodată — același component merge pe buton întunecat (text alb → spinner alb) și pe fundal
 * deschis (text primary → spinner negru), fără prop de culoare separat.
 */
export default function Spinner({
  size = "sm",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const sizeCls = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${sizeCls} ${className}`}
    />
  );
}
