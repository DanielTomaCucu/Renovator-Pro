package ro.renovatorpro.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import ro.renovatorpro.adapter.out.persistence.converter.CurrencyConverter;
import ro.renovatorpro.adapter.out.persistence.converter.MoneyConverter;
import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.Money;

@Entity
@Table(name = "projects")
public class ProjectEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Convert(converter = MoneyConverter.class)
    @Column(name = "total_budget", nullable = false)
    private Money totalBudget;

    @Convert(converter = CurrencyConverter.class)
    @Column(nullable = false)
    private Currency currency;

    @Column(name = "total_area")
    private Double totalArea;

    @Column(name = "owner_id", nullable = false)
    private String ownerId;

    public ProjectEntity() {
        // JPA
    }

    public ProjectEntity(String id, String title, Money totalBudget, Currency currency, Double totalArea, String ownerId) {
        this.id = id;
        this.title = title;
        this.totalBudget = totalBudget;
        this.currency = currency;
        this.totalArea = totalArea;
        this.ownerId = ownerId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Money getTotalBudget() { return totalBudget; }
    public void setTotalBudget(Money totalBudget) { this.totalBudget = totalBudget; }
    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    public Double getTotalArea() { return totalArea; }
    public void setTotalArea(Double totalArea) { this.totalArea = totalArea; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
}
