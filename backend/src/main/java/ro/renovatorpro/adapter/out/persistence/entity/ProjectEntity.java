package ro.renovatorpro.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ro.renovatorpro.adapter.out.persistence.converter.CurrencyConverter;
import ro.renovatorpro.adapter.out.persistence.converter.MoneyConverter;
import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.Money;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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
}
