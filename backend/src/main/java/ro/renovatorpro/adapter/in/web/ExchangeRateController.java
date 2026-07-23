package ro.renovatorpro.adapter.in.web;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ro.renovatorpro.adapter.in.web.dto.ExchangeRateResponse;
import ro.renovatorpro.application.port.in.GetExchangeRateUseCase;
import ro.renovatorpro.domain.model.ExchangeRateSnapshot;

/** Curs valutar EUR→RON preluat automat (BNR), cache 24h — vezi {@code GetExchangeRateService}. */
@RestController
@RequiredArgsConstructor
public class ExchangeRateController {

    private final GetExchangeRateUseCase getExchangeRateUseCase;

    @GetMapping("/api/exchange-rate")
    public ExchangeRateResponse get() {
        ExchangeRateSnapshot snapshot = getExchangeRateUseCase.execute();
        return new ExchangeRateResponse(snapshot.rate(), snapshot.fetchedAt(), snapshot.source());
    }
}
