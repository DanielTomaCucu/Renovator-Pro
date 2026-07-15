package ro.renovatorpro.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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

    public RoomEntity() {
        // JPA
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public RoomType getType() { return type; }
    public void setType(RoomType type) { this.type = type; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Money getAllocatedBudget() { return allocatedBudget; }
    public void setAllocatedBudget(Money allocatedBudget) { this.allocatedBudget = allocatedBudget; }
    public FlooringType getFloorMaterial() { return floorMaterial; }
    public void setFloorMaterial(FlooringType floorMaterial) { this.floorMaterial = floorMaterial; }
    public Double getFloorArea() { return floorArea; }
    public void setFloorArea(Double floorArea) { this.floorArea = floorArea; }
    public Double getPerimeter() { return perimeter; }
    public void setPerimeter(Double perimeter) { this.perimeter = perimeter; }
    public TileSize getTileSize() { return tileSize; }
    public void setTileSize(TileSize tileSize) { this.tileSize = tileSize; }
    public InstallationType getInstallationType() { return installationType; }
    public void setInstallationType(InstallationType installationType) { this.installationType = installationType; }
    public Double getBaseboardHeight() { return baseboardHeight; }
    public void setBaseboardHeight(Double baseboardHeight) { this.baseboardHeight = baseboardHeight; }
    public RoomShape getWallShape() { return wallShape; }
    public void setWallShape(RoomShape wallShape) { this.wallShape = wallShape; }
    public Map<Wall, RoomDoor> getDoors() { return doors; }
    public void setDoors(Map<Wall, RoomDoor> doors) { this.doors = doors; }
    public Map<Wall, RoomWindow> getWindows() { return windows; }
    public void setWindows(Map<Wall, RoomWindow> windows) { this.windows = windows; }
    public WallTiling getWallTiling() { return wallTiling; }
    public void setWallTiling(WallTiling wallTiling) { this.wallTiling = wallTiling; }
    public WallFinish getWallFinish() { return wallFinish; }
    public void setWallFinish(WallFinish wallFinish) { this.wallFinish = wallFinish; }
}
