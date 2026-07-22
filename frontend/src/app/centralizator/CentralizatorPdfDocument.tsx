import { Document, Page, View, Text, Font, StyleSheet } from "@react-pdf/renderer";
import { Currency, Item, Project, Room } from "@/shared/types";
import { formatMoney, itemTotal, itemsForRoom, materialUnit, roomSubtotal } from "@/shared/functions";

// Helvetica (fontul implicit PDF) nu are diacritice românești (ă/â/î/ș/ț) — înregistrăm Inter, la fel
// ca la exportul din Configurare Apartament (`ApartmentPdfDocument.tsx`).
Font.register({
  family: "Inter",
  fonts: [
    { src: "/fonts/inter-latin-ext-400-normal.woff", fontWeight: 400 },
    { src: "/fonts/inter-latin-ext-700-normal.woff", fontWeight: 700 },
  ],
});

const COLOR_BLACK = "#000000";
const COLOR_GRAY_DARK = "#334155";
const COLOR_GRAY = "#64748b";
const COLOR_LINE = "#d9dee6";
const COLOR_LINE_STRONG = "#94a3b8";

// Design tip factură — alb-negru, tabele cu linii subțiri, aproape fără culoare (aceleași convenții
// ca `ApartmentPdfDocument.tsx`, ca cele două exporturi din aplicație să arate la fel).
const styles = StyleSheet.create({
  page: { padding: 28, paddingBottom: 40, fontSize: 9, color: COLOR_BLACK, fontFamily: "Inter" },
  brand: { fontSize: 8, color: COLOR_GRAY, textTransform: "uppercase", letterSpacing: 1 },
  h1: { fontSize: 16, fontWeight: 700, marginTop: 2 },
  muted: { color: COLOR_GRAY, fontSize: 8 },
  headerRule: { borderBottomWidth: 1.5, borderBottomColor: COLOR_BLACK, paddingBottom: 8, marginBottom: 10 },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLOR_LINE_STRONG,
    marginBottom: 16,
  },
  statCell: { flex: 1, padding: 6, borderRightWidth: 1, borderRightColor: COLOR_LINE },
  statCellLast: { flex: 1, padding: 6 },
  statLabel: { fontSize: 7, color: COLOR_GRAY, textTransform: "uppercase", marginBottom: 2 },
  statValue: { fontSize: 11, fontWeight: 700 },
  roomTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 14,
  },
  table: { borderTopWidth: 1, borderTopColor: COLOR_LINE_STRONG },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR_LINE_STRONG,
    paddingVertical: 4,
  },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: COLOR_LINE, paddingVertical: 4 },
  th: { fontSize: 7, fontWeight: 700, color: COLOR_GRAY, textTransform: "uppercase" },
  td: { fontSize: 8, color: COLOR_BLACK },
  tdMuted: { fontSize: 8, color: COLOR_GRAY },
  colName: { flex: 3 },
  colSource: { flex: 2 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.3, textAlign: "right" },
  colTotal: { flex: 1.3, textAlign: "right" },
  colStatus: { flex: 1.4, textAlign: "right" },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BLACK,
  },
  subtotalLabel: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", color: COLOR_GRAY_DARK, marginRight: 10 },
  subtotalValue: { fontSize: 10, fontWeight: 700 },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: COLOR_BLACK,
  },
  grandTotalLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase" },
  grandTotalValue: { fontSize: 18, fontWeight: 700 },
  footer: {
    position: "absolute",
    bottom: 14,
    left: 28,
    right: 28,
    fontSize: 7,
    color: COLOR_GRAY,
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: COLOR_LINE,
    paddingTop: 5,
  },
});

function ItemRow({ item, currency }: { item: Item; currency: Currency }) {
  return (
    <View style={styles.tableRow} wrap={false}>
      <Text style={[styles.td, styles.colName]}>{item.name}</Text>
      <Text style={[styles.tdMuted, styles.colSource]}>{item.source || "—"}</Text>
      <Text style={[styles.td, styles.colQty]}>{item.quantity} {materialUnit(item.materialType)}</Text>
      <Text style={[styles.td, styles.colPrice]}>{formatMoney(item.unitPrice, currency)}</Text>
      <Text style={[styles.td, styles.colTotal]}>{formatMoney(itemTotal(item), currency)}</Text>
      <Text style={[styles.tdMuted, styles.colStatus]}>{item.status}</Text>
    </View>
  );
}

function RoomSection({ room, items, currency }: { room: Room; items: Item[]; currency: Currency }) {
  const roomItems = itemsForRoom(items, room.id);
  if (roomItems.length === 0) return null;
  const subtotal = roomSubtotal(items, room.id);

  return (
    <View wrap={false}>
      <Text style={styles.roomTitle}>{room.name}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.th, styles.colName]}>Element</Text>
          <Text style={[styles.th, styles.colSource]}>Sursă</Text>
          <Text style={[styles.th, styles.colQty]}>Cant.</Text>
          <Text style={[styles.th, styles.colPrice]}>Preț unitar</Text>
          <Text style={[styles.th, styles.colTotal]}>Total</Text>
          <Text style={[styles.th, styles.colStatus]}>Status</Text>
        </View>
        {roomItems.map((item) => (
          <ItemRow key={item.id} item={item} currency={currency} />
        ))}
      </View>
      <View style={styles.subtotalRow}>
        <Text style={styles.subtotalLabel}>Subtotal {room.name}</Text>
        <Text style={styles.subtotalValue}>{formatMoney(subtotal, currency)}</Text>
      </View>
    </View>
  );
}

/**
 * Documentul PDF exportat de pe „Tabel Centralizator" — design tip factură (alb-negru, linii subțiri,
 * aproape fără culoare), NU un screenshot/print al paginii cu bulinele colorate de status/tip material.
 * Un tabel simplu, pe cameră, cu subtotal, și un total general la final — ca o factură reală.
 */
export default function CentralizatorPdfDocument({
  project,
  rooms,
  items,
  estimated,
  spent,
  efficiency,
}: {
  project: Project;
  rooms: Room[];
  items: Item[];
  estimated: number;
  spent: number;
  efficiency: number;
}) {
  const generatedAt = new Date().toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document title={`${project.title} — Tabel Centralizator`}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerRule}>
          <Text style={styles.brand}>Renovator Pro — Tabel Centralizator</Text>
          <Text style={styles.h1}>{project.title}</Text>
          <Text style={styles.muted}>Generat la {generatedAt}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Total estimat proiect</Text>
            <Text style={styles.statValue}>{formatMoney(estimated, project.currency)}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Total cheltuit la zi</Text>
            <Text style={styles.statValue}>{formatMoney(spent, project.currency)}</Text>
          </View>
          <View style={styles.statCellLast}>
            <Text style={styles.statLabel}>Eficiență bugetară</Text>
            <Text style={styles.statValue}>{efficiency}%</Text>
          </View>
        </View>

        {rooms.map((room) => (
          <RoomSection key={room.id} room={room} items={items} currency={project.currency} />
        ))}

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total general estimat</Text>
          <Text style={styles.grandTotalValue}>{formatMoney(estimated, project.currency)}</Text>
        </View>

        <Text style={styles.footer} fixed>
          Renovator Pro — Tabel Centralizator
        </Text>
      </Page>
    </Document>
  );
}
