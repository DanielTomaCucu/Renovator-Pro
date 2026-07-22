package ro.renovatorpro.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ro.renovatorpro.adapter.out.persistence.converter.InspirationTypeConverter;
import ro.renovatorpro.domain.model.InspirationType;

import java.time.Instant;

@Entity
@Table(name = "inspiration_images")
@Getter
@Setter
@NoArgsConstructor
public class InspirationImageEntity {

    @Id
    private String id;

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Column(name = "room_id")
    private String roomId;

    @Convert(converter = InspirationTypeConverter.class)
    @Column(nullable = false)
    private InspirationType type;

    @Column(columnDefinition = "text", nullable = false)
    private String image;

    @Column
    private String caption;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
