-- V12 — Cache pt. cursul valutar EUR/RON preluat automat (BNR, gratuit, fără cheie API). Un singur rând
-- per pereche de monede; reîmprospătat de GetExchangeRateService doar când `fetched_at` are peste 24h.

CREATE TABLE exchange_rate_cache (
    id              VARCHAR(36) PRIMARY KEY,
    base_currency   VARCHAR(3) NOT NULL,
    quote_currency  VARCHAR(3) NOT NULL,
    rate            NUMERIC(10, 4) NOT NULL,
    fetched_at      TIMESTAMPTZ NOT NULL,
    source          VARCHAR(20) NOT NULL,
    UNIQUE (base_currency, quote_currency)
);
