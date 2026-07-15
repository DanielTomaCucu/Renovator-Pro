package ro.renovatorpro.adapter.in.web.dto;

import java.math.BigDecimal;

/** Oglindă a `Project` din api-contract.md — enum-urile sunt String (label cu diacritice), nu tip de domeniu. */
public record ProjectResponse(String id, String title, BigDecimal totalBudget, String currency, Double totalArea) {
}
