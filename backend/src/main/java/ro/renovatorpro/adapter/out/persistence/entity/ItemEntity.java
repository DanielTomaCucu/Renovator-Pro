package ro.renovatorpro.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import ro.renovatorpro.adapter.out.persistence.converter.ItemOriginConverter;
import ro.renovatorpro.adapter.out.persistence.converter.ItemStatusConverter;
import ro.renovatorpro.adapter.out.persistence.converter.MaterialTypeConverter;
import ro.renovatorpro.adapter.out.persistence.converter.MoneyConverter;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;

import java.math.BigDecimal;

@Entity
@Table(name = "items")
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

    public ItemEntity() {
        // JPA
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public MaterialType getMaterialType() { return materialType; }
    public void setMaterialType(MaterialType materialType) { this.materialType = materialType; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public ItemStatus getStatus() { return status; }
    public void setStatus(ItemStatus status) { this.status = status; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public Money getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Money unitPrice) { this.unitPrice = unitPrice; }
    public String getProductUrl() { return productUrl; }
    public void setProductUrl(String productUrl) { this.productUrl = productUrl; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public ItemOrigin getOrigin() { return origin; }
    public void setOrigin(ItemOrigin origin) { this.origin = origin; }
}
