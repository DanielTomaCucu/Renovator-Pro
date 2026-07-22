package ro.renovatorpro.domain.exception;

/**
 * ⚠️ Deviere deliberată de la practica standard „nu confirma dacă un email există": în mod normal un flux
 * de reset ar răspunde identic indiferent dacă emailul e găsit sau nu (răspunsul real pleacă doar prin
 * email). Aici NU există email real (mod dev — token-ul se afișează direct în UI, vezi
 * `RequestPasswordResetService`) — a ascunde „cont negăsit" ar însemna pur și simplu să nu arătăm nimic
 * userului, fără alternativă. Acceptabil pt. o aplicație personală; într-un context de producție reală cu
 * email efectiv trimis, acest comportament ar trebui revizuit (răspuns uniform 202, indiferent de rezultat).
 */
public class PasswordResetAccountNotFoundException extends DomainException {

    public PasswordResetAccountNotFoundException(String email) {
        super("Niciun cont cu acest email: " + email);
    }
}
