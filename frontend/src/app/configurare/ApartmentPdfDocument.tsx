import { Document, Page, View, Text, Font, StyleSheet } from "@react-pdf/renderer";
import { Currency, Project, Room, RoomShape, TechnicalSummary, Wall } from "@/shared/types";
import { computeRoomDimensions, formatMoney } from "@/shared/functions";
import { WALL_LABELS, ROOM_TYPE_DESCRIPTION } from "./RoomTechnicalCard";
import { buildRoomCalcRows } from "./roomCalcRows";
import RoomSketchPdf from "./RoomSketchPdf";

// Helvetica (fontul implicit PDF) nu are diacritice românești (ă/â/î/ș/ț) — înregistrăm Inter (subset
// latin-ext, care le include) din `/public/fonts`, self-hostat, ca exportul să nu depindă de o cerere
// externă la generare.
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

// Design tip factură — alb-negru, tabele cu linii subțiri, aproape fără culoare (accentul de culoare
// rămas e doar la simbolurile funcționale ușă/fereastră din schiță, nu în restul documentului).
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
    marginBottom: 10,
  },
  statCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: COLOR_LINE,
  },
  statCellLast: { flex: 1, padding: 6 },
  statLabel: { fontSize: 7, color: COLOR_GRAY, textTransform: "uppercase", marginBottom: 2 },
  statValue: { fontSize: 11, fontWeight: 700 },
  tocRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_LINE,
  },
  roomTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1.5,
    borderBottomColor: COLOR_BLACK,
    paddingBottom: 6,
    marginBottom: 8,
  },
  roomTitle: { fontSize: 13, fontWeight: 700 },
  roomSubtitle: { fontSize: 8, color: COLOR_GRAY, textTransform: "uppercase", marginTop: 1 },
  budgetBadge: { fontSize: 10, fontWeight: 700 },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  colGap: { width: 14 },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: COLOR_GRAY_DARK,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_LINE_STRONG,
    paddingBottom: 3,
    marginBottom: 3,
  },
  specSectionWrap: { marginBottom: 8 },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR_LINE,
  },
  specLabel: { color: COLOR_GRAY_DARK },
  specValue: { fontWeight: 700 },
  sketchWrap: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLOR_LINE_STRONG,
    padding: 4,
    marginBottom: 8,
  },
  calcRow: { marginBottom: 4, borderBottomWidth: 0.5, borderBottomColor: COLOR_LINE, paddingBottom: 4 },
  calcRowTop: { flexDirection: "row", justifyContent: "space-between" },
  calcLabel: { color: COLOR_GRAY_DARK },
  calcValue: { fontWeight: 700 },
  calcDetail: { fontSize: 7, color: COLOR_GRAY },
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

type SpecItem = { label: string; value: string };
type SpecSection = { title: string; items: SpecItem[] };

/** Grupează datele tehnice completate ale camerei în secțiuni afișabile simplu, pentru citire rapidă de pe șantier. */
function buildRoomSpecs(room: Room): SpecSection[] {
  const sections: SpecSection[] = [];

  const floorItems: SpecItem[] = [];
  if (room.floorMaterial) floorItems.push({ label: "Material", value: room.floorMaterial });
  if (room.floorArea) floorItems.push({ label: "Suprafață", value: `${room.floorArea.toFixed(2)} mp` });
  if (room.perimeter) floorItems.push({ label: "Perimetru", value: `${room.perimeter.toFixed(2)} ml` });
  if (room.tileSize) floorItems.push({ label: "Mărime plăci", value: room.tileSize });
  if (room.installationType) floorItems.push({ label: "Tip montaj", value: room.installationType });
  if (room.baseboardHeight) floorItems.push({ label: "Înălțime plintă", value: `${Math.round(room.baseboardHeight * 100)} cm` });
  if (floorItems.length) sections.push({ title: "Pardoseală", items: floorItems });

  const wallLengths = room.wallTiling?.wallLengths ?? room.wallFinish?.wallLengths;
  if (wallLengths) {
    const wallItems: SpecItem[] = [];
    const shapeLabel =
      room.wallShape === RoomShape.Patrat
        ? "Pătrat"
        : room.wallShape === RoomShape.Dreptunghi
          ? "Dreptunghi"
          : room.wallShape === RoomShape.Neregulata
            ? "Neregulată"
            : undefined;
    if (shapeLabel) wallItems.push({ label: "Formă cameră", value: shapeLabel });
    Object.values(Wall).forEach((w) => {
      if (wallLengths[w]) wallItems.push({ label: `Perete ${WALL_LABELS[w]}`, value: `${wallLengths[w]!.toFixed(2)} m` });
    });
    if (room.wallTiling?.tileHeight) {
      wallItems.push({ label: "Înălțime placare", value: `${room.wallTiling.tileHeight.toFixed(2)} m` });
    }
    if (room.wallFinish?.wallHeight) {
      wallItems.push({ label: "Înălțime pereți", value: `${room.wallFinish.wallHeight.toFixed(2)} m` });
      Object.values(Wall).forEach((w) => {
        const finish = room.wallFinish!.finishes[w];
        if (finish) wallItems.push({ label: `Finisaj ${WALL_LABELS[w]}`, value: finish });
      });
    }
    if (wallItems.length) sections.push({ title: "Pereți", items: wallItems });
  }

  const doorEntries = Object.entries(room.doors ?? {});
  if (doorEntries.length) {
    sections.push({
      title: "Uși",
      items: doorEntries.map(([w, d]) => ({
        label: `Perete ${WALL_LABELS[w as Wall]}`,
        value: `${d!.width.toFixed(2)} × ${d!.height.toFixed(2)} m (L×H)`,
      })),
    });
  }

  const windowEntries = Object.entries(room.windows ?? {});
  if (windowEntries.length) {
    sections.push({
      title: "Ferestre",
      items: windowEntries.map(([w, win]) => ({
        label: `Perete ${WALL_LABELS[w as Wall]}`,
        value: `${win!.width.toFixed(2)} × ${win!.height.toFixed(2)} m (L×H)`,
      })),
    });
  }

  return sections;
}

function SpecTable({ section }: { section: SpecSection }) {
  return (
    <View style={styles.specSectionWrap}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.items.map((item, i) => (
        <View key={i} style={styles.specRow}>
          <Text style={styles.specLabel}>{item.label}</Text>
          <Text style={styles.specValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

function RoomPage({
  room,
  index,
  total,
  currency,
}: {
  room: Room;
  index: number;
  total: number;
  currency: Currency;
}) {
  const specs = buildRoomSpecs(room);
  // Valorile SALVATE, autoritative, vin de la server (`room.dimensions`); fallback la calculul client
  // pentru o cameră fără breakdown-ul de la server (Problema 2 din audit).
  const calcRows = buildRoomCalcRows(room, room.dimensions ?? computeRoomDimensions(room));
  const half = Math.ceil(specs.length / 2);
  const leftSpecs = specs.slice(0, half);
  const rightSpecs = specs.slice(half);

  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.roomTitleRow}>
        <View>
          <Text style={styles.roomTitle}>{room.name}</Text>
          <Text style={styles.roomSubtitle}>{ROOM_TYPE_DESCRIPTION[room.type]}</Text>
        </View>
        {room.allocatedBudget > 0 && (
          <Text style={styles.budgetBadge}>Buget alocat: {formatMoney(room.allocatedBudget, currency)}</Text>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          {leftSpecs.map((s) => (
            <SpecTable key={s.title} section={s} />
          ))}
        </View>
        <View style={styles.colGap} />
        <View style={styles.col}>
          {rightSpecs.map((s) => (
            <SpecTable key={s.title} section={s} />
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.sectionTitle}>Schiță Tehnică</Text>
          <View style={styles.sketchWrap}>
            <RoomSketchPdf room={room} />
          </View>
        </View>
        <View style={styles.colGap} />
        <View style={styles.col}>
          <Text style={styles.sectionTitle}>Calcule Detaliate (necesar de materiale)</Text>
          {calcRows.length === 0 ? (
            <Text style={styles.muted}>Completează pardoseala pentru a vedea calculele.</Text>
          ) : (
            calcRows.map((row) => (
              <View key={row.label} style={styles.calcRow}>
                <View style={styles.calcRowTop}>
                  <Text style={styles.calcLabel}>{row.label}</Text>
                  <Text style={styles.calcValue}>{row.value}</Text>
                </View>
                <Text style={styles.calcDetail}>Formulă: {row.formula}</Text>
                <Text style={styles.calcDetail}>Calcul: {row.math}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      <Text style={styles.footer} fixed>
        Renovator Pro — Configurare Apartament · Cameră {index + 1} / {total}
      </Text>
    </Page>
  );
}

/**
 * Documentul PDF exportat de pe pagina „Configurare Apartament" — NU un print/screenshot al paginii, ci
 * un raport dedicat, o pagină per cameră: cotele tehnice completate (pardoseală/pereți/uși/ferestre),
 * schița tehnică (aceeași geometrie ca în UI, din `roomSketchGeometry.ts`) și calculele de necesar de
 * materiale — simplu de citit pentru un constructor pe șantier, fără elemente de navigare/UI ale paginii.
 * Camerele fără nicio dată tehnică completată nu apar deloc (nici în cuprins, nici ca pagină) — n-are
 * rost o pagină goală „nu există configurare” pentru o cameră netratată încă.
 */
export default function ApartmentPdfDocument({
  project,
  rooms,
  technical,
}: {
  project: Project;
  rooms: Room[];
  // Sumarul tehnic agregat, calculat server-side (Problema 2 din audit) — pasat din pagina de configurare.
  technical: TechnicalSummary;
}) {
  const summary = technical;
  const generatedAt = new Date().toLocaleDateString("ro-RO", { year: "numeric", month: "long", day: "numeric" });
  const configuredRooms = rooms.filter((r) => buildRoomSpecs(r).length > 0);

  return (
    <Document title={`${project.title} — Configurare Apartament`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRule}>
          <Text style={styles.brand}>Renovator Pro — Configurare Apartament</Text>
          <Text style={styles.h1}>{project.title}</Text>
          <Text style={styles.muted}>Generat la {generatedAt}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Suprafață utilă</Text>
            <Text style={styles.statValue}>{(project.totalArea ?? summary.totalFloorArea).toFixed(1)} mp</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Buget total</Text>
            <Text style={styles.statValue}>{formatMoney(project.totalBudget, project.currency)}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Camere configurate</Text>
            <Text style={styles.statValue}>
              {configuredRooms.length} / {rooms.length}
            </Text>
          </View>
          <View style={styles.statCellLast}>
            <Text style={styles.statLabel}>Progres configurare</Text>
            <Text style={styles.statValue}>{Math.round(summary.configuredRoomsRatio * 100)}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Cuprins</Text>
        {configuredRooms.map((r, i) => (
          <View key={r.id} style={styles.tocRow}>
            <Text>
              {i + 1}. {r.name}
            </Text>
            <Text style={styles.muted}>{ROOM_TYPE_DESCRIPTION[r.type]}</Text>
          </View>
        ))}
      </Page>

      {configuredRooms.map((room, i) => (
        <RoomPage key={room.id} room={room} index={i} total={configuredRooms.length} currency={project.currency} />
      ))}
    </Document>
  );
}
