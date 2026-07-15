/**
 * Barrel de re-export pentru toate tipurile din domeniu.
 * Regulă: un fișier nou per interfață/enum (vezi CLAUDE.md → „Tipuri de date”).
 * Importă din „@/shared/types" în cod, nu direct din fișierele individuale.
 */
export * from "./RoomType";
export * from "./ItemStatus";
export * from "./ItemOrigin";
export * from "./MaterialType";
export * from "./Currency";
export * from "./FlooringType";
export * from "./TileSize";
export * from "./InstallationType";
export * from "./Wall";
export * from "./RoomDoor";
export * from "./WallTiling";
export * from "./WallFinishType";
export * from "./WallFinish";
export * from "./RoomWindow";
export * from "./RoomShape";
export * from "./RoomDimensions";
export * from "./Room";
export * from "./Item";
export * from "./Project";
export * from "./ProjectSummary";
export * from "./RenovationStore";
export * from "./DonutSegment";
