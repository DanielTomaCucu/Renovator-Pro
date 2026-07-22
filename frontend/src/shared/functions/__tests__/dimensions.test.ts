import { describe, expect, it } from "vitest";
import {
  estimatedSquareWallSide,
  totalDoorWidth,
  doorArea,
  windowArea,
  windowTrimLength,
  hasFloorConfig,
  roomPerimeter,
  baseboardLength,
  baseboardTileArea,
  floorWasteRatio,
  floorMaterialNeeded,
  barsNeeded,
  paintLiters,
  wallTilingWasteRatio,
  netWallTilingArea,
  wallTilingArea,
  netFloorTilingArea,
  ceilingPaintArea,
  paintAboveTilingArea,
  paintPrimerLiters,
  tilingPrimerLiters,
  groutKgPerSqm,
  floorAdhesiveKg,
  wallAdhesiveKg,
  adhesiveBags,
  groutKg,
  underlayArea,
  wallFinishArea,
  computeRoomDimensions,
} from "../dimensions";
import {
  FlooringType,
  InstallationType,
  Room,
  RoomType,
  TileSize,
  Wall,
  WallFinishType,
} from "../../types";

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: "room-1",
    type: RoomType.Living,
    name: "Living",
    allocatedBudget: 0,
    ...overrides,
  };
}

const fullWallLengths = { [Wall.Nord]: 4, [Wall.Est]: 3, [Wall.Sud]: 4, [Wall.Vest]: 3 };

describe("estimatedSquareWallSide", () => {
  it("returnează 0 fără floorArea", () => {
    expect(estimatedSquareWallSide(makeRoom())).toBe(0);
  });

  it("returnează 0 pentru floorArea 0", () => {
    expect(estimatedSquareWallSide(makeRoom({ floorArea: 0 }))).toBe(0);
  });

  it("returnează 0 pentru floorArea negativ", () => {
    expect(estimatedSquareWallSide(makeRoom({ floorArea: -10 }))).toBe(0);
  });

  it("calculează rădăcina pătrată a suprafeței", () => {
    expect(estimatedSquareWallSide(makeRoom({ floorArea: 16 }))).toBe(4);
  });

  it("calculează pentru o suprafață non-perfect-pătrată", () => {
    expect(estimatedSquareWallSide(makeRoom({ floorArea: 20 }))).toBeCloseTo(Math.sqrt(20));
  });
});

describe("totalDoorWidth", () => {
  it("returnează 0 fără uși", () => {
    expect(totalDoorWidth(makeRoom())).toBe(0);
  });

  it("returnează 0 pentru doors gol", () => {
    expect(totalDoorWidth(makeRoom({ doors: {} }))).toBe(0);
  });

  it("însumează lățimea unei singure uși", () => {
    expect(totalDoorWidth(makeRoom({ doors: { [Wall.Nord]: { width: 0.9, height: 2.1 } } }))).toBeCloseTo(0.9);
  });

  it("însumează lățimile a mai multor uși pe pereți diferiți", () => {
    const room = makeRoom({
      doors: {
        [Wall.Nord]: { width: 0.9, height: 2.1 },
        [Wall.Est]: { width: 0.8, height: 2.0 },
      },
    });
    expect(totalDoorWidth(room)).toBeCloseTo(1.7);
  });
});

describe("doorArea / windowArea", () => {
  it("doorArea returnează 0 fără ușă pe peretele dat", () => {
    expect(doorArea(makeRoom(), Wall.Nord)).toBe(0);
  });

  it("doorArea calculează lățime x înălțime", () => {
    const room = makeRoom({ doors: { [Wall.Nord]: { width: 0.9, height: 2.1 } } });
    expect(doorArea(room, Wall.Nord)).toBeCloseTo(1.89);
  });

  it("doorArea returnează 0 pentru un perete fără ușă chiar dacă alt perete are", () => {
    const room = makeRoom({ doors: { [Wall.Nord]: { width: 0.9, height: 2.1 } } });
    expect(doorArea(room, Wall.Sud)).toBe(0);
  });

  it("windowArea returnează 0 fără fereastră", () => {
    expect(windowArea(makeRoom(), Wall.Est)).toBe(0);
  });

  it("windowArea calculează lățime x înălțime", () => {
    const room = makeRoom({ windows: { [Wall.Est]: { width: 1.2, height: 1.4 } } });
    expect(windowArea(room, Wall.Est)).toBeCloseTo(1.68);
  });
});

describe("windowTrimLength", () => {
  it("returnează 0 fără ferestre", () => {
    expect(windowTrimLength(makeRoom())).toBe(0);
  });

  it("calculează perimetrul unei singure ferestre cu 5% pierdere", () => {
    const room = makeRoom({ windows: { [Wall.Nord]: { width: 1, height: 1.5 } } });
    const perimeter = 2 * (1 + 1.5);
    expect(windowTrimLength(room)).toBeCloseTo(perimeter * 1.05);
  });

  it("însumează mai multe ferestre pe pereți diferiți", () => {
    const room = makeRoom({
      windows: {
        [Wall.Nord]: { width: 1, height: 1.5 },
        [Wall.Sud]: { width: 1.2, height: 1.2 },
      },
    });
    const perimeter = 2 * (1 + 1.5) + 2 * (1.2 + 1.2);
    expect(windowTrimLength(room)).toBeCloseTo(perimeter * 1.05);
  });
});

describe("hasFloorConfig", () => {
  it("false fără material și fără suprafață", () => {
    expect(hasFloorConfig(makeRoom())).toBe(false);
  });

  it("false doar cu material, fără suprafață", () => {
    expect(hasFloorConfig(makeRoom({ floorMaterial: FlooringType.Gresie }))).toBe(false);
  });

  it("false doar cu suprafață, fără material", () => {
    expect(hasFloorConfig(makeRoom({ floorArea: 20 }))).toBe(false);
  });

  it("false cu suprafață 0", () => {
    expect(hasFloorConfig(makeRoom({ floorMaterial: FlooringType.Gresie, floorArea: 0 }))).toBe(false);
  });

  it("true cu material și suprafață pozitivă", () => {
    expect(hasFloorConfig(makeRoom({ floorMaterial: FlooringType.Gresie, floorArea: 20 }))).toBe(true);
  });
});

describe("roomPerimeter", () => {
  it("returnează 0 pentru o cameră fără date", () => {
    expect(roomPerimeter(makeRoom())).toBe(0);
  });

  it("folosește perimeter explicit dacă e completat", () => {
    expect(roomPerimeter(makeRoom({ perimeter: 18 }))).toBe(18);
  });

  it("derivă din suma celor 4 lungimi de perete (wallTiling.wallLengths) dacă toate sunt >0", () => {
    const room = makeRoom({
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths },
    });
    expect(roomPerimeter(room)).toBe(14);
  });

  it("derivă din wallFinish.wallLengths dacă toate 4 sunt completate", () => {
    const room = makeRoom({
      wallFinish: { wallHeight: 2.5, wallLengths: fullWallLengths, finishes: {} },
    });
    expect(roomPerimeter(room)).toBe(14);
  });

  it("ignoră wallLengths dacă nu toate cele 4 sunt completate (>0), cade pe fallback pătrat", () => {
    const room = makeRoom({
      floorArea: 16,
      wallTiling: {
        tiledWallsCount: 2,
        tileHeight: 1.5,
        wallLengths: { [Wall.Nord]: 4, [Wall.Est]: 3, [Wall.Sud]: 0, [Wall.Vest]: 3 },
      },
    });
    expect(roomPerimeter(room)).toBe(16); // 4*sqrt(16)
  });

  it("fallback la 4*sqrt(floorArea) fără perimeter/wallLengths", () => {
    expect(roomPerimeter(makeRoom({ floorArea: 25 }))).toBe(20);
  });

  it("perimeter explicit are prioritate peste wallLengths", () => {
    const room = makeRoom({
      perimeter: 99,
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths },
    });
    expect(roomPerimeter(room)).toBe(99);
  });
});

describe("baseboardLength", () => {
  it("returnează 0 pentru o cameră fără perimetru", () => {
    expect(baseboardLength(makeRoom())).toBe(0);
  });

  it("calculează perimetru minus uși, cu 5% pierdere", () => {
    const room = makeRoom({ perimeter: 20, doors: { [Wall.Nord]: { width: 1, height: 2.1 } } });
    expect(baseboardLength(room)).toBeCloseTo((20 - 1) * 1.05);
  });

  it("nu scade sub 0 chiar dacă ușile depășesc perimetrul (Math.max(0, ...))", () => {
    const room = makeRoom({ perimeter: 1, doors: { [Wall.Nord]: { width: 5, height: 2.1 } } });
    expect(baseboardLength(room)).toBe(0);
  });

  it("fără uși, aplică doar pierderea de 5% la perimetru", () => {
    const room = makeRoom({ perimeter: 10 });
    expect(baseboardLength(room)).toBeCloseTo(10.5);
  });
});

describe("baseboardTileArea", () => {
  it("returnează 0 dacă pardoseala nu e Gresie", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.ParchetLaminat,
      perimeter: 10,
      baseboardHeight: 0.08,
    });
    expect(baseboardTileArea(room)).toBe(0);
  });

  it("returnează 0 fără baseboardHeight", () => {
    const room = makeRoom({ floorMaterial: FlooringType.Gresie, perimeter: 10 });
    expect(baseboardTileArea(room)).toBe(0);
  });

  it("calculează lungime plintă x înălțime la Gresie", () => {
    const room = makeRoom({ floorMaterial: FlooringType.Gresie, perimeter: 10, baseboardHeight: 0.08 });
    expect(baseboardTileArea(room)).toBeCloseTo(10 * 1.05 * 0.08);
  });
});

describe("floorWasteRatio", () => {
  it("10% implicit fără installationType (Drept)", () => {
    expect(floorWasteRatio(makeRoom())).toBeCloseTo(0.1);
  });

  it("10% explicit Drept", () => {
    expect(floorWasteRatio(makeRoom({ installationType: InstallationType.Drept }))).toBeCloseTo(0.1);
  });

  it("15% Diagonal", () => {
    expect(floorWasteRatio(makeRoom({ installationType: InstallationType.Diagonal }))).toBeCloseTo(0.15);
  });

  it("18% Herringbone", () => {
    expect(floorWasteRatio(makeRoom({ installationType: InstallationType.Herringbone }))).toBeCloseTo(0.18);
  });

  it("+2% supliment pentru TileSize.Mare", () => {
    expect(floorWasteRatio(makeRoom({ tileSize: TileSize.Mare }))).toBeCloseTo(0.12);
  });

  it("+2% supliment pentru TileSize.FoarteMare", () => {
    expect(floorWasteRatio(makeRoom({ tileSize: TileSize.FoarteMare }))).toBeCloseTo(0.12);
  });

  it("fără supliment pentru TileSize.Mica/Medie", () => {
    expect(floorWasteRatio(makeRoom({ tileSize: TileSize.Mica }))).toBeCloseTo(0.1);
    expect(floorWasteRatio(makeRoom({ tileSize: TileSize.Medie }))).toBeCloseTo(0.1);
  });

  it("combină Diagonal + plăci mari = 17%", () => {
    const room = makeRoom({ installationType: InstallationType.Diagonal, tileSize: TileSize.Mare });
    expect(floorWasteRatio(room)).toBeCloseTo(0.17);
  });

  it("combină Herringbone + plăci foarte mari = 20%", () => {
    const room = makeRoom({ installationType: InstallationType.Herringbone, tileSize: TileSize.FoarteMare });
    expect(floorWasteRatio(room)).toBeCloseTo(0.2);
  });
});

describe("floorMaterialNeeded", () => {
  it("returnează 0 fără configurare de pardoseală", () => {
    expect(floorMaterialNeeded(makeRoom())).toBe(0);
  });

  it("calculează necesarul cu pierdere 10% fără plintă (non-Gresie)", () => {
    const room = makeRoom({ floorMaterial: FlooringType.ParchetLaminat, floorArea: 20 });
    expect(floorMaterialNeeded(room)).toBeCloseTo(22);
  });

  it("include suprafața de plintă la Gresie", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      floorArea: 20,
      perimeter: 18,
      baseboardHeight: 0.08,
    });
    const floor = 20 * 1.1;
    const baseboardArea = 18 * 1.05 * 0.08;
    expect(floorMaterialNeeded(room)).toBeCloseTo(floor + baseboardArea);
  });
});

describe("barsNeeded", () => {
  it("returnează 0 pentru lungime 0", () => {
    expect(barsNeeded(0)).toBe(0);
  });

  it("returnează 0 pentru lungime negativă", () => {
    expect(barsNeeded(-5)).toBe(0);
  });

  it("rotunjește în sus la un multiplu de 2m", () => {
    expect(barsNeeded(3)).toBe(2);
  });

  it("returnează exact numărul de bare pentru un multiplu exact de 2", () => {
    expect(barsNeeded(4)).toBe(2);
  });

  it("rotunjește în sus pentru valori mici sub 2m", () => {
    expect(barsNeeded(0.5)).toBe(1);
  });
});

describe("paintLiters", () => {
  it("returnează 0 pentru arie 0", () => {
    expect(paintLiters(0)).toBe(0);
  });

  it("returnează 0 pentru arie negativă", () => {
    expect(paintLiters(-10)).toBe(0);
  });

  it("calculează litri cu 2 straturi, 11mp/l, rotunjit la 0.5", () => {
    // 11 mp * 2 straturi / 11 = 2 litri exact
    expect(paintLiters(11)).toBe(2);
  });

  it("rotunjește în sus la cel mai apropiat 0.5 litri", () => {
    // 10 mp: (10*2)/11 = 1.818 -> ceil la 0.5 -> 2
    expect(paintLiters(10)).toBe(2);
  });

  it("rotunjește corect o valoare care cade exact pe .5", () => {
    // 5.5mp: (5.5*2)/11 = 1 -> exact 1
    expect(paintLiters(5.5)).toBe(1);
  });
});

describe("wallTilingWasteRatio", () => {
  it("10% fără goluri pe pereții placați", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths },
    });
    expect(wallTilingWasteRatio(room)).toBeCloseTo(0.1);
  });

  it("10% cu exact 1 gol pe pereții placați", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths },
      doors: { [Wall.Nord]: { width: 0.9, height: 2.1 } },
    });
    expect(wallTilingWasteRatio(room)).toBeCloseTo(0.1);
  });

  it("12% cu >1 gol (ușă+fereastră) pe pereții placați", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths },
      doors: { [Wall.Nord]: { width: 0.9, height: 2.1 } },
      windows: { [Wall.Est]: { width: 1.2, height: 1.4 } },
    });
    expect(wallTilingWasteRatio(room)).toBeCloseTo(0.12);
  });

  it("gol pe un perete neplacat nu se numără", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 1, tileHeight: 1.5, wallLengths: fullWallLengths },
      doors: { [Wall.Sud]: { width: 0.9, height: 2.1 } },
    });
    expect(wallTilingWasteRatio(room)).toBeCloseTo(0.1);
  });
});

describe("netWallTilingArea / wallTilingArea", () => {
  it("returnează 0 fără wallTiling", () => {
    expect(netWallTilingArea(makeRoom())).toBe(0);
    expect(wallTilingArea(makeRoom())).toBe(0);
  });

  it("returnează 0 dacă pardoseala nu e Gresie", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.ParchetLaminat,
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths },
    });
    expect(netWallTilingArea(room)).toBe(0);
    expect(wallTilingArea(room)).toBe(0);
  });

  it("calculează aria netă pentru toți cei 4 pereți placați, fără goluri", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths },
    });
    const totalLength = 4 + 3 + 4 + 3;
    expect(netWallTilingArea(room)).toBeCloseTo(totalLength * 1.5);
  });

  it("scade aria golurilor (ușă) de pe pereții placați", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 1, tileHeight: 1.5, wallLengths: fullWallLengths },
      doors: { [Wall.Nord]: { width: 0.9, height: 2.1 } },
    });
    const gross = 4 * 1.5;
    const doorAreaVal = 0.9 * 2.1;
    expect(netWallTilingArea(room)).toBeCloseTo(gross - doorAreaVal);
  });

  it("nu scade sub 0 (Math.max) dacă golurile depășesc aria brută", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 1, tileHeight: 0.5, wallLengths: fullWallLengths },
      doors: { [Wall.Nord]: { width: 4, height: 2.5 } },
    });
    expect(netWallTilingArea(room)).toBe(0);
  });

  it("ia în calcul doar pereții placați limitați de tiledWallsCount, ignoră restul", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 2, tileHeight: 1.5, wallLengths: fullWallLengths },
    });
    const totalLength = 4 + 3; // Nord + Est only
    expect(netWallTilingArea(room)).toBeCloseTo(totalLength * 1.5);
  });

  it("wallTilingArea aplică pierderea de 10%/12% peste aria netă", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths },
    });
    const net = netWallTilingArea(room);
    expect(wallTilingArea(room)).toBeCloseTo(net * 1.1);
  });
});

describe("netFloorTilingArea", () => {
  it("returnează 0 fără Gresie", () => {
    expect(netFloorTilingArea(makeRoom({ floorMaterial: FlooringType.ParchetLaminat, floorArea: 20 }))).toBe(0);
  });

  it("returnează 0 fără floorArea", () => {
    expect(netFloorTilingArea(makeRoom({ floorMaterial: FlooringType.Gresie }))).toBe(0);
  });

  it("returnează floorArea direct (fără pierdere) la Gresie", () => {
    expect(netFloorTilingArea(makeRoom({ floorMaterial: FlooringType.Gresie, floorArea: 20 }))).toBe(20);
  });
});

describe("ceilingPaintArea", () => {
  it("returnează 0 fără ceilingPaint activat", () => {
    expect(ceilingPaintArea(makeRoom({ floorArea: 20 }))).toBe(0);
  });

  it("returnează 0 fără floorArea, chiar cu ceilingPaint true", () => {
    expect(ceilingPaintArea(makeRoom({ ceilingPaint: true }))).toBe(0);
  });

  it("calculează floorArea * 1.10 cu ceilingPaint activat", () => {
    expect(ceilingPaintArea(makeRoom({ ceilingPaint: true, floorArea: 20 }))).toBeCloseTo(22);
  });

  it("returnează 0 pentru floorArea 0 chiar cu ceilingPaint true", () => {
    expect(ceilingPaintArea(makeRoom({ ceilingPaint: true, floorArea: 0 }))).toBe(0);
  });
});

describe("paintAboveTilingArea", () => {
  it("returnează 0 fără wallTiling", () => {
    expect(paintAboveTilingArea(makeRoom())).toBe(0);
  });

  it("returnează 0 dacă pardoseala nu e Gresie", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.ParchetLaminat,
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths, roomHeight: 2.5 },
    });
    expect(paintAboveTilingArea(room)).toBe(0);
  });

  it("returnează 0 fără roomHeight", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths },
    });
    expect(paintAboveTilingArea(room)).toBe(0);
  });

  it("returnează 0 dacă roomHeight <= tileHeight", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 4, tileHeight: 2.5, wallLengths: fullWallLengths, roomHeight: 2.5 },
    });
    expect(paintAboveTilingArea(room)).toBe(0);
  });

  it("calculează aria de deasupra faianței pentru pereții placați (fără scădere de goluri)", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths, roomHeight: 2.5 },
    });
    const extraHeight = 1;
    const tiledArea = (4 + 3 + 4 + 3) * extraHeight;
    expect(paintAboveTilingArea(room)).toBeCloseTo(tiledArea * 1.1);
  });

  it("pereții neplacați cu lungime completată scad golurile lor din vopsea", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: {
        tiledWallsCount: 1,
        tileHeight: 1.5,
        wallLengths: fullWallLengths,
        roomHeight: 2.5,
      },
      doors: { [Wall.Sud]: { width: 0.9, height: 2.1 } },
    });
    const extraHeight = 1;
    const tiledArea = 4 * extraHeight; // Nord only
    const sudUntiled = Math.max(0, 4 * 2.5 - 0.9 * 2.1);
    const estUntiled = 3 * 2.5;
    const vestUntiled = 3 * 2.5;
    const untiledArea = sudUntiled + estUntiled + vestUntiled;
    expect(paintAboveTilingArea(room)).toBeCloseTo((tiledArea + untiledArea) * 1.1);
  });

  it("pereții neplacați fără lungime completată (0) nu contribuie", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: {
        tiledWallsCount: 1,
        tileHeight: 1.5,
        wallLengths: { [Wall.Nord]: 4, [Wall.Est]: 0, [Wall.Sud]: 0, [Wall.Vest]: 0 },
        roomHeight: 2.5,
      },
    });
    const extraHeight = 1;
    expect(paintAboveTilingArea(room)).toBeCloseTo(4 * extraHeight * 1.1);
  });
});

describe("wallFinishArea", () => {
  it("returnează 0 fără wallFinish", () => {
    expect(wallFinishArea(makeRoom(), WallFinishType.Vopsea)).toBe(0);
  });

  it("returnează 0 dacă niciun perete nu are finisajul cerut", () => {
    const room = makeRoom({
      wallFinish: { wallHeight: 2.5, wallLengths: fullWallLengths, finishes: {} },
    });
    expect(wallFinishArea(room, WallFinishType.Vopsea)).toBe(0);
  });

  it("returnează 0 dacă pardoseala e Gresie (wallFinish e doar pt. Parchet/Mochetă)", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallFinish: { wallHeight: 2.5, wallLengths: fullWallLengths, finishes: { [Wall.Nord]: WallFinishType.Vopsea } },
    });
    expect(wallFinishArea(room, WallFinishType.Vopsea)).toBe(0);
  });

  it("calculează aria de vopsea cu pierdere 10% pentru un perete", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.ParchetLaminat,
      wallFinish: { wallHeight: 2.5, wallLengths: fullWallLengths, finishes: { [Wall.Nord]: WallFinishType.Vopsea } },
    });
    expect(wallFinishArea(room, WallFinishType.Vopsea)).toBeCloseTo(4 * 2.5 * 1.1);
  });

  it("calculează aria de tapet cu pierdere 15%", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.ParchetLaminat,
      wallFinish: { wallHeight: 2.5, wallLengths: fullWallLengths, finishes: { [Wall.Est]: WallFinishType.Tapet } },
    });
    expect(wallFinishArea(room, WallFinishType.Tapet)).toBeCloseTo(3 * 2.5 * 1.15);
  });

  it("scade golurile (ușă) de pe pereții cu finisajul respectiv", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.ParchetLaminat,
      wallFinish: { wallHeight: 2.5, wallLengths: fullWallLengths, finishes: { [Wall.Nord]: WallFinishType.Vopsea } },
      doors: { [Wall.Nord]: { width: 0.9, height: 2.1 } },
    });
    const gross = 4 * 2.5 - 0.9 * 2.1;
    expect(wallFinishArea(room, WallFinishType.Vopsea)).toBeCloseTo(gross * 1.1);
  });

  it("nu scade sub 0 chiar dacă golul depășește aria brută", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.ParchetLaminat,
      wallFinish: { wallHeight: 0.5, wallLengths: fullWallLengths, finishes: { [Wall.Nord]: WallFinishType.Vopsea } },
      doors: { [Wall.Nord]: { width: 4, height: 2.5 } },
    });
    expect(wallFinishArea(room, WallFinishType.Vopsea)).toBe(0);
  });

  it("combină mai mulți pereți cu același finisaj", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.ParchetLaminat,
      wallFinish: {
        wallHeight: 2.5,
        wallLengths: fullWallLengths,
        finishes: { [Wall.Nord]: WallFinishType.Vopsea, [Wall.Sud]: WallFinishType.Vopsea },
      },
    });
    const totalLength = 4 + 4;
    expect(wallFinishArea(room, WallFinishType.Vopsea)).toBeCloseTo(totalLength * 2.5 * 1.1);
  });
});

describe("paintPrimerLiters", () => {
  it("returnează 0 fără nicio arie de vopsit", () => {
    expect(paintPrimerLiters(makeRoom())).toBe(0);
  });

  it("calculează amorsa rotunjită în sus la litru întreg", () => {
    const room = makeRoom({ ceilingPaint: true, floorArea: 10 });
    const area = 10 * 1.1;
    expect(paintPrimerLiters(room)).toBe(Math.ceil(area * 0.1));
  });

  it("combină vopsea + tavan + deasupra faianței", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.ParchetLaminat,
      ceilingPaint: true,
      floorArea: 20,
      wallFinish: { wallHeight: 2.5, wallLengths: fullWallLengths, finishes: { [Wall.Nord]: WallFinishType.Vopsea } },
    });
    const paint = wallFinishArea(room, WallFinishType.Vopsea);
    const ceiling = ceilingPaintArea(room);
    const above = paintAboveTilingArea(room);
    expect(paintPrimerLiters(room)).toBe(Math.ceil((paint + ceiling + above) * 0.1));
  });
});

describe("tilingPrimerLiters", () => {
  it("returnează 0 fără arii de placare", () => {
    expect(tilingPrimerLiters(makeRoom())).toBe(0);
  });

  it("calculează amorsa pentru pardoseală + faianță, rotunjit în sus", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      floorArea: 10,
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths },
    });
    const area = netFloorTilingArea(room) + netWallTilingArea(room);
    expect(tilingPrimerLiters(room)).toBe(Math.ceil(area * 0.15));
  });
});

describe("groutKgPerSqm", () => {
  it("returnează valoarea pt. Medie ca implicit fără size", () => {
    expect(groutKgPerSqm(undefined)).toBeCloseTo(0.24);
  });

  it.each([
    [TileSize.Mica, 0.45],
    [TileSize.Medie, 0.24],
    [TileSize.Mare, 0.1],
    [TileSize.FoarteMare, 0.08],
  ])("returnează consumul corect pentru %s", (size, expected) => {
    expect(groutKgPerSqm(size)).toBeCloseTo(expected);
  });
});

describe("floorAdhesiveKg / wallAdhesiveKg", () => {
  it("floorAdhesiveKg returnează 0 fără arie", () => {
    expect(floorAdhesiveKg(makeRoom())).toBe(0);
  });

  it("floorAdhesiveKg calculează cu consum implicit Medie + 10% marjă", () => {
    const room = makeRoom({ floorMaterial: FlooringType.Gresie, floorArea: 10 });
    expect(floorAdhesiveKg(room)).toBeCloseTo(10 * 3.5 * 1.1);
  });

  it("floorAdhesiveKg folosește tileSize specificat", () => {
    const room = makeRoom({ floorMaterial: FlooringType.Gresie, floorArea: 10, tileSize: TileSize.Mare });
    expect(floorAdhesiveKg(room)).toBeCloseTo(10 * 5.5 * 1.1);
  });

  it("wallAdhesiveKg returnează 0 fără faianță", () => {
    expect(wallAdhesiveKg(makeRoom())).toBe(0);
  });

  it("wallAdhesiveKg calculează cu tileSize propriu al placării", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      wallTiling: { tiledWallsCount: 4, tileHeight: 1.5, wallLengths: fullWallLengths, tileSize: TileSize.FoarteMare },
    });
    const net = netWallTilingArea(room);
    expect(wallAdhesiveKg(room)).toBeCloseTo(net * 7.0 * 1.1);
  });
});

describe("adhesiveBags", () => {
  it("returnează 0 fără niciun adeziv necesar", () => {
    expect(adhesiveBags(makeRoom())).toBe(0);
  });

  it("rotunjește în sus la saci de 25kg (pardoseală + faianță)", () => {
    const room = makeRoom({ floorMaterial: FlooringType.Gresie, floorArea: 10 });
    const totalKg = floorAdhesiveKg(room);
    expect(adhesiveBags(room)).toBe(Math.ceil(totalKg / 25));
  });
});

describe("groutKg", () => {
  it("returnează 0 fără arie de placare", () => {
    expect(groutKg(makeRoom())).toBe(0);
  });

  it("calculează chitul pentru pardoseală, rotunjit în sus la kg întreg, +10% marjă", () => {
    const room = makeRoom({ floorMaterial: FlooringType.Gresie, floorArea: 10 });
    const floorKg = 10 * 0.24;
    expect(groutKg(room)).toBe(Math.ceil(floorKg * 1.1));
  });
});

describe("underlayArea", () => {
  it("returnează 0 pentru pardoseală care nu e Parchet Laminat", () => {
    expect(underlayArea(makeRoom({ floorMaterial: FlooringType.Gresie, floorArea: 20 }))).toBe(0);
  });

  it("returnează 0 fără floorArea", () => {
    expect(underlayArea(makeRoom({ floorMaterial: FlooringType.ParchetLaminat }))).toBe(0);
  });

  it("returnează 0 pentru floorArea 0", () => {
    expect(underlayArea(makeRoom({ floorMaterial: FlooringType.ParchetLaminat, floorArea: 0 }))).toBe(0);
  });

  it("calculează aria de folie cu 5% suprapunere, rotunjit în sus la mp întreg", () => {
    const room = makeRoom({ floorMaterial: FlooringType.ParchetLaminat, floorArea: 20 });
    expect(underlayArea(room)).toBe(Math.ceil(20 * 1.05));
  });
});

describe("computeRoomDimensions", () => {
  it("returnează toate valorile 0/false pentru o cameră complet neconfigurată", () => {
    const result = computeRoomDimensions(makeRoom());
    expect(result.hasFloorConfig).toBe(false);
    expect(result.floorMaterialNeeded).toBe(0);
    expect(result.baseboardLength).toBe(0);
    expect(result.wallTilingArea).toBe(0);
    expect(result.paintArea).toBe(0);
    expect(result.wallpaperArea).toBe(0);
    expect(result.windowTrimLength).toBe(0);
    expect(result.totalDoorWidth).toBe(0);
    expect(result.paintLiters).toBe(0);
    expect(result.baseboardBars).toBe(0);
    expect(result.windowTrimBars).toBe(0);
    expect(result.ceilingPaintArea).toBe(0);
    expect(result.paintAboveTilingArea).toBe(0);
    expect(result.paintPrimerLiters).toBe(0);
    expect(result.tilingPrimerLiters).toBe(0);
    expect(result.floorAdhesiveKg).toBe(0);
    expect(result.wallAdhesiveKg).toBe(0);
    expect(result.adhesiveBags).toBe(0);
    expect(result.groutKg).toBe(0);
    expect(result.underlayArea).toBe(0);
    expect(result.floorWasteRatio).toBeCloseTo(0.1);
  });

  it("cameră cu Gresie și placare pe toți cei 4 pereți, ușă și fereastră, produce toate câmpurile coerente", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.Gresie,
      floorArea: 20,
      perimeter: 18,
      baseboardHeight: 0.08,
      tileSize: TileSize.Mare,
      installationType: InstallationType.Diagonal,
      doors: { [Wall.Nord]: { width: 0.9, height: 2.1 } },
      windows: { [Wall.Sud]: { width: 1.2, height: 1.4 } },
      ceilingPaint: true,
      wallTiling: {
        tiledWallsCount: 4,
        tileHeight: 1.5,
        wallLengths: fullWallLengths,
        roomHeight: 2.5,
        tileSize: TileSize.Mare,
      },
    });
    const result = computeRoomDimensions(room);
    expect(result.hasFloorConfig).toBe(true);
    expect(result.floorMaterialNeeded).toBeCloseTo(floorMaterialNeeded(room));
    expect(result.wallTilingArea).toBeCloseTo(wallTilingArea(room));
    expect(result.floorWasteRatio).toBeCloseTo(0.17); // diagonal(0.15) + tile mare(0.02)
    expect(result.baseboardLength).toBeCloseTo(baseboardLength(room));
    expect(result.windowTrimLength).toBeCloseTo(windowTrimLength(room));
    expect(result.totalDoorWidth).toBeCloseTo(0.9);
    expect(result.floorAdhesiveKg).toBeGreaterThan(0);
    expect(result.wallAdhesiveKg).toBeGreaterThan(0);
    expect(result.adhesiveBags).toBeGreaterThan(0);
    expect(result.groutKg).toBeGreaterThan(0);
    expect(result.ceilingPaintArea).toBeCloseTo(20 * 1.1);
  });

  it("cameră cu Parchet Laminat, finisaj vopsea pe un perete, fără faianță", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.ParchetLaminat,
      floorArea: 15,
      perimeter: 16,
      underfloorHeating: true,
      wallFinish: { wallHeight: 2.5, wallLengths: fullWallLengths, finishes: { [Wall.Nord]: WallFinishType.Vopsea } },
    });
    const result = computeRoomDimensions(room);
    expect(result.hasFloorConfig).toBe(true);
    expect(result.wallTilingArea).toBe(0);
    expect(result.paintArea).toBeCloseTo(wallFinishArea(room, WallFinishType.Vopsea));
    expect(result.underlayArea).toBeCloseTo(underlayArea(room));
    expect(result.floorAdhesiveKg).toBe(0);
    expect(result.wallAdhesiveKg).toBe(0);
    expect(result.groutKg).toBe(0);
  });

  it("cameră cu Mochetă (fără underlay, fără faianță)", () => {
    const room = makeRoom({ floorMaterial: FlooringType.Mocheta, floorArea: 12, perimeter: 14 });
    const result = computeRoomDimensions(room);
    expect(result.underlayArea).toBe(0);
    expect(result.wallTilingArea).toBe(0);
  });

  it("cameră cu tapet pe un perete produce wallpaperArea > 0 și paintArea = 0", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.ParchetLaminat,
      floorArea: 15,
      wallFinish: { wallHeight: 2.5, wallLengths: fullWallLengths, finishes: { [Wall.Est]: WallFinishType.Tapet } },
    });
    const result = computeRoomDimensions(room);
    expect(result.wallpaperArea).toBeGreaterThan(0);
    expect(result.paintArea).toBe(0);
  });

  it("baseboardBars și windowTrimBars respectă barsNeeded pe lungimile calculate", () => {
    const room = makeRoom({
      floorMaterial: FlooringType.ParchetLaminat,
      floorArea: 15,
      perimeter: 10,
      windows: { [Wall.Nord]: { width: 1, height: 1.5 } },
    });
    const result = computeRoomDimensions(room);
    expect(result.baseboardBars).toBe(barsNeeded(baseboardLength(room)));
    expect(result.windowTrimBars).toBe(barsNeeded(windowTrimLength(room)));
  });
});
