package ro.renovatorpro.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import ro.renovatorpro.adapter.out.persistence.converter.MoneyConverter;
import ro.renovatorpro.domain.model.Money;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "offers")
@Getter
@Setter
@NoArgsConstructor
public class OfferEntity {

    @Id
    private String id;

    @Column(name = "group_id", nullable = false)
    private String groupId;

    @Column
    private String name;

    @Column
    private String store;

    @Convert(converter = MoneyConverter.class)
    @Column(name = "unit_price")
    private Money unitPrice;

    @Column
    private BigDecimal quantity;

    @Column(name = "product_url")
    private String productUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private List<String> images;

    @Column
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
