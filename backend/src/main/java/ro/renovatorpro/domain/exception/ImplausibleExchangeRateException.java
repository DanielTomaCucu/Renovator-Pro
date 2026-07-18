package ro.renovatorpro.domain.exception;

/**
 * Curs valutar în afara intervalului plauzibil RON↔EUR (BIZ-1, docs/tickete-audit-calcule-securitate.md).
 * Conversia e destructivă și persistată — o typo (0.497 în loc de 4.97) ar distruge ireversibil toate
 * sumele proiectului. Nu blocăm complet cursuri neobișnuite (pot exista alte monede în viitor), doar
 * cerem o valoare rezonabilă pt. RON/EUR de azi.
 */
public class ImplausibleExchangeRateException extends DomainException {

    public ImplausibleExchangeRateException(double min, double max) {
        super("Curs valutar neplauzibil — pentru RON/EUR, valoarea trebuie să fie între " + min + " și " + max
                + ". Verifică dacă n-ai introdus cursul invers (ex. 0.20 în loc de 4.97).");
    }
}
