package ro.renovatorpro.application.port.out;

import java.math.BigDecimal;

/** Preia cursul EUR→RON curent de la o sursă externă (implementarea reală vorbește cu BNR). */
public interface ExchangeRateFetcher {

    BigDecimal fetchEurToRonRate();
}
