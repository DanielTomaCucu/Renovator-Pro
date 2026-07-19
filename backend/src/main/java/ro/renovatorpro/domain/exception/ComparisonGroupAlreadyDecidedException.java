package ro.renovatorpro.domain.exception;

/** Mutarea unui grup de comparație în altă cameră e permisă doar cât timp e „În analiză". */
public class ComparisonGroupAlreadyDecidedException extends DomainException {

    public ComparisonGroupAlreadyDecidedException(String id) {
        super("Grupul " + id + " e deja decis — nu mai poate fi mutat în altă cameră");
    }
}
