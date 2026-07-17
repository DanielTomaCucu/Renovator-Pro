/**
 * Mapare centralizată nume-Material-Symbol pentru fiecare concept din UI.
 * Sursă: HTML-ul real generat de Stitch (proiect 14594146001803528847), NU presupuneri.
 * Detaliu complet + ecrane de referință: CLAUDE.md → secțiunea „Iconițe”.
 *
 * De ce există fișierul: dacă tastăm string-uri de iconiță direct în JSX, orice
 * schimbare de nume Material Symbol trebuie căutată manual în tot codul. Aici e un
 * singur loc de adevăr — restul aplicației importă din acest fișier, nu hardcodează.
 */

import { FlooringType, InstallationType, ItemStatus, RoomType, TileSize } from "./types";

export const NAV_ICONS = {
  logo: "architecture",
  configurare: "home_work",
  elemente: "shopping_cart",
  centralizator: "table_chart",
  analiza: "leaderboard",
  galerie: "auto_awesome",
  setari: "settings",
  collapseSidebar: "menu_open",
  sidebarAddRoom: "add_circle",
  search: "search",
  profil: "account_circle",
  mobileMenu: "menu",
} as const;

export const ROOM_TYPE_ICONS: Record<RoomType, string> = {
  [RoomType.Dormitor]: "king_bed",
  [RoomType.Baie]: "bathtub",
  [RoomType.Living]: "chair",
  [RoomType.Bucatarie]: "soup_kitchen",
  [RoomType.Terasa]: "deck",
  [RoomType.Balcon]: "balcony",
};

export const ACTION_ICONS = {
  add: "add",
  addRoom: "add_home",
  addItem: "add_shopping_cart",
  editItem: "edit_square",
  editInline: "edit",
  delete: "delete",
  close: "close",
  confirmDelete: "warning",
  quickAdd: "bolt",
  expandMore: "expand_more",
  viewDetails: "visibility",
  save: "save",
  link: "link",
  image: "image",
  sortIndicator: "unfold_more",
  sortAscending: "arrow_upward",
  sortDescending: "arrow_downward",
  photoCamera: "photo_camera",
  checkCircle: "check_circle",
  notConfigured: "radio_button_unchecked",
  moreVert: "more_vert",
} as const;

export const STATUS_ICONS: Record<ItemStatus, string> = {
  [ItemStatus.Cumparat]: "check_circle",
  [ItemStatus.Planificat]: "calendar_today",
  [ItemStatus.InAsteptare]: "calendar_today",
};

export const DOCUMENT_ICONS = {
  exportPdf: "picture_as_pdf",
  print: "print",
  share: "share",
  download: "download",
} as const;

export const ANALYTICS_ICONS = {
  costPerRoom: "pie_chart",
  categoryBreakdown: "bar_chart",
  expenseTimeline: "timeline",
  tipOptimizare: "tips_and_updates",
  alertaBuget: "error_outline",
  statusProiect: "task_alt",
  economii: "trending_down",
  actualizare: "update",
  overview: "dashboard",
} as const;

/** Iconițe pentru pagina „Tabel Centralizator" (ecran Stitch „Tabel Centralizator - Meniu Restrâns Premium"). */
export const CENTRALIZATOR_ICONS = {
  totalEstimat: "payments",
  totalCheltuit: "account_balance_wallet",
  eficientaBugetara: "monitoring",
  eficientaBugetaraBadge: "analytics",
  tabelDetaliat: "analytics",
  statusInAsteptare: "schedule",
  trendUp: "trending_up",
} as const;

/**
 * Iconițe pentru configurarea tehnică a camerei (ecran desktop „Configurare Tehnică Apartament",
 * proiect Stitch 14594146001803528847, ecranul „Configurare Tehnică - Layout Optimizat Rezultate").
 */
export const FLOORING_TYPE_ICONS: Record<FlooringType, string> = {
  [FlooringType.ParchetLaminat]: "view_column",
  [FlooringType.Gresie]: "grid_view",
  [FlooringType.Mocheta]: "texture",
};

/** Iconițe pt. select-ul „Mărime plăci” — mărimea vizuală a iconiței crește odată cu dimensiunea plăcii. */
export const TILE_SIZE_ICONS: Record<TileSize, string> = {
  [TileSize.Mica]: "grid_on",
  [TileSize.Medie]: "grid_view",
  [TileSize.Mare]: "crop_square",
  [TileSize.FoarteMare]: "crop_din",
};

/** Iconițe pt. select-ul „Tip montaj” — sugerează vizual orientarea plăcilor. */
export const INSTALLATION_TYPE_ICONS: Record<InstallationType, string> = {
  [InstallationType.Drept]: "straighten",
  [InstallationType.Diagonal]: "north_east",
  [InstallationType.Herringbone]: "grain",
};

export const TECHNICAL_ICONS = {
  projectEfficiency: "architecture",
  floorAndWalls: "layers",
  doorConfig: "door_front",
  windowConfig: "window",
  wallTilingConfig: "grid_view",
  blueprintPlaceholder: "design_services",
  calculatedResults: "calculate",
  saveConfig: "save",
  addRoomEmpty: "add_circle",
  totalArea: "square_foot",
  info: "info",
  shapeSquare: "crop_square",
  shapeRectangle: "crop_landscape",
  shapeIrregular: "gesture",
} as const;

/** Iconițe pentru „Setări Proiect" (ecran Stitch „Setări Proiect - Configurare Monedă"). */
export const SETTINGS_ICONS = {
  currencyExchange: "currency_exchange",
  verifiedUser: "verified_user",
} as const;
