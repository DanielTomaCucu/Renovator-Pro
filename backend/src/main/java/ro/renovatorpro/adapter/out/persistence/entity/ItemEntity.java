package ro.renovatorpro.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ro.renovatorpro.adapter.out.persistence.converter.ItemOriginConverter;
import ro.renovatorpro.adapter.out.persistence.converter.ItemStatusConverter;
import ro.renovatorpro.adapter.out.persistence.converter.MaterialTypeConverter;
import ro.renovatorpro.adapter.out.persistence.converter.MoneyConverter;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
public class ItemEntity {

    @Id
    private String id;

    @Column(name = "room_id", nullable = false)
    private String roomId;

    @Column(nullable = false)
    private String name;

    @Convert(converter = MaterialTypeConverter.class)
    @Column(name = "material_type", nullable = false)
    private MaterialType materialType;

    @Column(nullable = false)
    private String source;

    @Convert(converter = ItemStatusConverter.class)
    @Column(nullable = false)
    private ItemStatus status;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Convert(converter = MoneyConverter.class)
    @Column(name = "unit_price", nullable = false)
    private Money unitPrice;

    @Column(name = "product_url")
    private String productUrl;

    @Column(name = "image_url")
    private String imageUrl;

    @Convert(converter = ItemOriginConverter.class)
    @Column(nullable = false)
    private ItemOrigin origin;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "purchased_at")
    private Instant purchasedAt;
}
