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
import ro.renovatorpro.adapter.out.persistence.converter.FlooringTypeConverter;
import ro.renovatorpro.adapter.out.persistence.converter.InstallationTypeConverter;
import ro.renovatorpro.adapter.out.persistence.converter.MoneyConverter;
import ro.renovatorpro.adapter.out.persistence.converter.RoomShapeConverter;
import ro.renovatorpro.adapter.out.persistence.converter.RoomTypeConverter;
import ro.renovatorpro.adapter.out.persistence.converter.TileSizeConverter;
import ro.renovatorpro.domain.model.FlooringType;
import ro.renovatorpro.domain.model.InstallationType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.RoomDoor;
import ro.renovatorpro.domain.model.RoomShape;
import ro.renovatorpro.domain.model.RoomType;
import ro.renovatorpro.domain.model.RoomWindow;
import ro.renovatorpro.domain.model.TileSize;
import ro.renovatorpro.domain.model.Wall;
import ro.renovatorpro.domain.model.WallFinish;
import ro.renovatorpro.domain.model.WallTiling;

import java.util.Map;

/**
 * Entitate JPA pentru cameră — SEPARATĂ de {@code domain.model.Room} (regula din blueprint §3).
 * Structurile per-perete (doors/windows/wallTiling/wallFinish) sunt persistate ca JSONB, refolosind
 * DIRECT tipurile de domeniu (Wall, RoomDoor, RoomWindow, WallTiling, WallFinish) ca formă serializată —
 * ele rămân POJO-uri/records simple, fără nicio adnotare JPA/Jackson pe ele însele, deci domeniul rămâne
 * curat; doar entitatea (acest fișier) știe că sunt persistate ca JSON.
 */
@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
public class RoomEntity {

    @Id
    private String id;

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Convert(converter = RoomTypeConverter.class)
    @Column(nullable = false)
    private RoomType type;

    @Column(nullable = false)
    private String name;

    @Convert(converter = MoneyConverter.class)
    @Column(name = "allocated_budget", nullable = false)
    private Money allocatedBudget;

    @Convert(converter = FlooringTypeConverter.class)
    @Column(name = "floor_material")
    private FlooringType floorMaterial;

    @Column(name = "floor_area")
    private Double floorArea;

    @Column
    private Double perimeter;

    @Convert(converter = TileSizeConverter.class)
    @Column(name = "tile_size")
    private TileSize tileSize;

    @Convert(converter = InstallationTypeConverter.class)
    @Column(name = "installation_type")
    private InstallationType installationType;

    @Column(name = "baseboard_height")
    private Double baseboardHeight;

    @Convert(converter = RoomShapeConverter.class)
    @Column(name = "wall_shape")
    private RoomShape wallShape;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<Wall, RoomDoor> doors;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<Wall, RoomWindow> windows;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "wall_tiling", columnDefinition = "jsonb")
    private WallTiling wallTiling;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "wall_finish", columnDefinition = "jsonb")
    private WallFinish wallFinish;

    @Column(name = "ceiling_paint")
    private Boolean ceilingPaint;

    @Column(name = "underfloor_heating")
    private Boolean underfloorHeating;
}
