package ro.renovatorpro.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ro.renovatorpro.adapter.out.persistence.converter.ComparisonGroupStatusConverter;
import ro.renovatorpro.adapter.out.persistence.converter.MaterialTypeConverter;
import ro.renovatorpro.domain.model.ComparisonGroupStatus;
import ro.renovatorpro.domain.model.MaterialType;

import java.time.Instant;

@Entity
@Table(name = "comparison_groups")
@Getter
@Setter
@NoArgsConstructor
public class ComparisonGroupEntity {

    @Id
    private String id;

    @Column(name = "room_id", nullable = false)
    private String roomId;

    @Column(nullable = false)
    private String name;

    @Convert(converter = MaterialTypeConverter.class)
    @Column(name = "material_type", nullable = false)
    private MaterialType materialType;

    @Convert(converter = ComparisonGroupStatusConverter.class)
    @Column(nullable = false)
    private ComparisonGroupStatus status;

    @Column(name = "chosen_offer_id")
    private String chosenOfferId;

    @Column(name = "created_item_id")
    private String createdItemId;

    @Column(name = "linked_item_id")
    private String linkedItemId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
