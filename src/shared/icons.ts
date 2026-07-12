/**
 * Mapare centralizată nume-Material-Symbol pentru fiecare concept din UI.
 * Sursă: HTML-ul real generat de Stitch (proiect 14594146001803528847), NU presupuneri.
 * Detaliu complet + ecrane de referință: CLAUDE.md → secțiunea „Iconițe”.
 *
 * De ce există fișierul: dacă tastăm string-uri de iconiță direct în JSX, orice
 * schimbare de nume Material Symbol trebuie căutată manual în tot codul. Aici e un
 * singur loc de adevăr — restul aplicației importă din acest fișier, nu hardcodează.
 */

import { FlooringType, ItemStatus, RoomType } from "./types";

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
} as const;

/**
 * Iconițe pentru configurarea tehnică a camerei (ecran desktop „Configurare Tehnică Apartament",
 * proiect Stitch 14594146001803528847, ecranul „Configurare Tehnică - Layout Optimizat Rezultate").
 */
export const FLOORING_TYPE_ICONS: Record<FlooringType, string> = {
  [FlooringType.ParchetLaminat]: "texture",
  [FlooringType.Gresie]: "grid_view",
  [FlooringType.Mocheta]: "texture",
};

export const TECHNICAL_ICONS = {
  projectEfficiency: "architecture",
  floorAndWalls: "layers",
  doorConfig: "door_front",
  wallTilingConfig: "grid_view",
  blueprintPlaceholder: "design_services",
  calculatedResults: "calculate",
  saveConfig: "save",
  addRoomEmpty: "add_circle",
} as const;
