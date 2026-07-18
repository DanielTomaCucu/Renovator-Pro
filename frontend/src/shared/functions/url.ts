/**
 * Validează că un URL e sigur de pus într-un `href` navigabil — doar `http:`/`https:` (SEC-2,
 * docs/tickete-audit-calcule-securitate.md). Backend-ul validează deja la salvare, dar orice link URL
 * randat direct într-un `<a href>` fără verificare e stored XSS potențial (ex. `javascript:...`) —
 * apărare în adâncime, în caz că un link ajunge din altă sursă decât formularul curent (import, API vechi).
 */
export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
