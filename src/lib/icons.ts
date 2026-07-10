/**
 * Mapare centralizată nume-Material-Symbol pentru fiecare concept din UI.
 * Sursă: HTML-ul real generat de Stitch (proiect 14594146001803528847), NU presupuneri.
 * Detaliu complet + ecrane de referință: CLAUDE.md → secțiunea „Iconițe”.
 *
 * De ce există fișierul: dacă tastăm string-uri de iconiță direct în JSX, orice
 * schimbare de nume Material Symbol trebuie căutată manual în tot codul. Aici e un
 * singur loc de adevăr — restul aplicației importă din acest fișier, nu hardcodează.
 */

import { RoomType } from "./types";

export const NAV_ICONS = {
  configurare: "home_work",
  elemente: "shopping_cart",
  centralizator: "table_chart",
  analiza: "leaderboard",
  galerie: "auto_awesome",
  setari: "settings",
  collapseSidebar: "keyboard_double_arrow_left",
  search: "search",
  profil: "account_circle",
} as const;

export const ROOM_TYPE_ICONS: Record<RoomType, string> = {
  Dormitor: "bed",
  Baie: "shower",
  Living: "chair",
  Bucătărie: "kitchen",
  Terasă: "deck",
  Balcon: "balcony",
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
} as const;

export const STATUS_ICONS = {
  Cumpărat: "check_circle",
  Planificat: "calendar_today",
  "În așteptare": "calendar_today",
} as const;

export const DOCUMENT_ICONS = {
  exportPdf: "picture_as_pdf",
  print: "print",
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
