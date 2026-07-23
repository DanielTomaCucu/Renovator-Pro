package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.ExchangeRateSnapshot;

public interface GetExchangeRateUseCase {

    /** Curs EUR→RON — din cache dacă are sub 24h, altfel reîmprospătat de la sursa externă (BNR). */
    ExchangeRateSnapshot execute();
}
