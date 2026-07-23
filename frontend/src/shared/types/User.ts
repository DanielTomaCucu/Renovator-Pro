/** Utilizatorul autentificat curent (Faza 5 — login pe username, nu email). `email` — obligatoriu la înregistrare (necesar pt. resetarea parolei), absent la conturile create înainte de această regulă. */
export interface User {
  id: string;
  username: string;
  email?: string;
}
