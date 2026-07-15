package ro.renovatorpro.adapter.in.web.mapper;

import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.FlooringType;
import ro.renovatorpro.domain.model.InstallationType;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.RoomShape;
import ro.renovatorpro.domain.model.RoomType;
import ro.renovatorpro.domain.model.TileSize;
import ro.renovatorpro.domain.model.Wall;
import ro.renovatorpro.domain.model.WallFinishType;

import java.math.BigDecimal;

/**
 * Conversii JSON (String, cu diacritice) ↔ enum-uri de domeniu, pentru mapper-ele MapStruct din
 * adapter/in/web — DTO-urile NICIODATĂ nu expun tipuri de domeniu direct (regulă din blueprint §3),
 * deci fiecare enum are un câmp String în DTO, tradus aici cu {@code label()}/{@code fromLabel()}
 * (aceeași abordare ca {@code LabelEnumConverter} din adapter/out/persistence, dar pt. JSON, nu JDBC).
 * Referențiate de mapper-e via {@code @Mapper(uses = DtoConversionSupport.class)} — MapStruct alege
 * automat metoda potrivită după tipul țintă, fără ambiguitate (fiecare enum e un tip Java distinct).
 */
public final class DtoConversionSupport {

    private DtoConversionSupport() {
    }

    public static Money toMoney(BigDecimal value) {
        return value == null ? null : Money.of(value);
    }

    public static BigDecimal toBigDecimal(Money value) {
        return value == null ? null : value.amount();
    }

    public static Currency toCurrency(String label) {
        return label == null ? null : Currency.fromLabel(label);
    }

    public static String fromCurrency(Currency value) {
        return value == null ? null : value.label();
    }

    public static RoomType toRoomType(String label) {
        return label == null ? null : RoomType.fromLabel(label);
    }

    public static String fromRoomType(RoomType value) {
        return value == null ? null : value.label();
    }

    public static FlooringType toFlooringType(String label) {
        return label == null ? null : FlooringType.fromLabel(label);
    }

    public static String fromFlooringType(FlooringType value) {
        return value == null ? null : value.label();
    }

    public static TileSize toTileSize(String label) {
        return label == null ? null : TileSize.fromLabel(label);
    }

    public static String fromTileSize(TileSize value) {
        return value == null ? null : value.label();
    }

    public static InstallationType toInstallationType(String label) {
        return label == null ? null : InstallationType.fromLabel(label);
    }

    public static String fromInstallationType(InstallationType value) {
        return value == null ? null : value.label();
    }

    public static RoomShape toRoomShape(String label) {
        return label == null ? null : RoomShape.fromLabel(label);
    }

    public static String fromRoomShape(RoomShape value) {
        return value == null ? null : value.label();
    }

    public static WallFinishType toWallFinishType(String label) {
        return label == null ? null : WallFinishType.fromLabel(label);
    }

    public static String fromWallFinishType(WallFinishType value) {
        return value == null ? null : value.label();
    }

    public static MaterialType toMaterialType(String label) {
        return label == null ? null : MaterialType.fromLabel(label);
    }

    public static String fromMaterialType(MaterialType value) {
        return value == null ? null : value.label();
    }

    public static ItemStatus toItemStatus(String label) {
        return label == null ? null : ItemStatus.fromLabel(label);
    }

    public static String fromItemStatus(ItemStatus value) {
        return value == null ? null : value.label();
    }

    public static ItemOrigin toItemOrigin(String label) {
        return label == null ? null : ItemOrigin.fromLabel(label);
    }

    public static String fromItemOrigin(ItemOrigin value) {
        return value == null ? null : value.label();
    }

    public static Wall toWall(String label) {
        return label == null ? null : Wall.fromLabel(label);
    }

    public static String fromWall(Wall value) {
        return value == null ? null : value.label();
    }
}
