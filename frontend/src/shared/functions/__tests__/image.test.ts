import { describe, expect, it, vi, afterEach } from "vitest";
import { compressImage } from "../image";

/**
 * happy-dom nu implementează decodarea reală de imagini (HTMLImageElement.onload nu se declanșează
 * niciodată singur pe un data URI de test, iar HTMLCanvasElement.getContext("2d")/toDataURL sunt
 * stub-uri fără randare reală). Testăm deci:
 *  - semnătura/parametrii impliciți,
 *  - căile de eroare care NU depind de decodare reală (FileReader.onerror, Image.onerror, canvas
 *    indisponibil),
 *  - fluxul de succes cu Image/canvas mock-uite manual (simulăm evenimentele native ca să verificăm
 *    logica de redimensionare/scale și parametrii transmiși la toDataURL).
 * Ce SĂRIM (documentat, nu testat): compresia JPEG reală / calitatea vizuală rezultată — ar necesita
 * un browser real (Playwright) sau un decodor real de imagine; happy-dom nu oferă un canvas 2D funcțional.
 */

function makeFile(content = "fake-image-bytes", type = "image/jpeg", name = "photo.jpg"): File {
  return new File([content], name, { type });
}

describe("compressImage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("este o funcție care returnează o Promise", () => {
    const file = makeFile();
    const result = compressImage(file);
    expect(result).toBeInstanceOf(Promise);
    result.catch(() => undefined);
  });

  it("acceptă parametri impliciți maxSide=1600 și quality=0.8 fără să arunce sincron", () => {
    const file = makeFile();
    let promise: Promise<string> | undefined;
    expect(() => {
      promise = compressImage(file);
    }).not.toThrow();
    promise!.catch(() => undefined);
  });

  it("acceptă maxSide și quality custom fără să arunce sincron", () => {
    const file = makeFile();
    let promise: Promise<string> | undefined;
    expect(() => {
      promise = compressImage(file, 800, 0.5);
    }).not.toThrow();
    promise!.catch(() => undefined);
  });

  it("respinge promisiunea cu mesaj 'Nu am putut citi fișierul' dacă FileReader eșuează", async () => {
    const file = makeFile();
    const originalReadAsDataURL = FileReader.prototype.readAsDataURL;
    FileReader.prototype.readAsDataURL = function (this: FileReader) {
      setTimeout(() => this.onerror?.(new ProgressEvent("error") as unknown as ProgressEvent<FileReader>), 0);
    };

    await expect(compressImage(file)).rejects.toThrow("Nu am putut citi fișierul");

    FileReader.prototype.readAsDataURL = originalReadAsDataURL;
  });

  it("respinge promisiunea cu mesaj 'Nu am putut încărca imaginea' dacă Image.onerror se declanșează", async () => {
    const file = makeFile();

    const originalReadAsDataURL = FileReader.prototype.readAsDataURL;
    FileReader.prototype.readAsDataURL = function (this: FileReader) {
      Object.defineProperty(this, "result", { value: "data:image/jpeg;base64,AAAA", configurable: true });
      setTimeout(() => this.onload?.(new ProgressEvent("load") as unknown as ProgressEvent<FileReader>), 0);
    };

    const OriginalImage = globalThis.Image;
    class FailingImage {
      onerror: (() => void) | null = null;
      onload: (() => void) | null = null;
      set src(_value: string) {
        setTimeout(() => this.onerror?.(), 0);
      }
    }
    // @ts-expect-error substituim global Image pentru test
    globalThis.Image = FailingImage;

    await expect(compressImage(file)).rejects.toThrow("Nu am putut încărca imaginea");

    globalThis.Image = OriginalImage;
    FileReader.prototype.readAsDataURL = originalReadAsDataURL;
  });

  it("respinge promisiunea cu mesaj 'Canvas indisponibil' dacă getContext('2d') returnează null", async () => {
    const file = makeFile();

    const originalReadAsDataURL = FileReader.prototype.readAsDataURL;
    FileReader.prototype.readAsDataURL = function (this: FileReader) {
      Object.defineProperty(this, "result", { value: "data:image/jpeg;base64,AAAA", configurable: true });
      setTimeout(() => this.onload?.(new ProgressEvent("load") as unknown as ProgressEvent<FileReader>), 0);
    };

    const OriginalImage = globalThis.Image;
    class SuccessImage {
      onerror: (() => void) | null = null;
      onload: (() => void) | null = null;
      width = 2000;
      height = 1000;
      set src(_value: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    // @ts-expect-error substituim global Image pentru test
    globalThis.Image = SuccessImage;

    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    await expect(compressImage(file)).rejects.toThrow("Canvas indisponibil");

    getContextSpy.mockRestore();
    globalThis.Image = OriginalImage;
    FileReader.prototype.readAsDataURL = originalReadAsDataURL;
  });

  it("redimensionează proporțional la maxSide și apelează toDataURL cu 'image/jpeg' și calitatea dată (flux de succes mock-uit)", async () => {
    const file = makeFile();

    const originalReadAsDataURL = FileReader.prototype.readAsDataURL;
    FileReader.prototype.readAsDataURL = function (this: FileReader) {
      Object.defineProperty(this, "result", { value: "data:image/jpeg;base64,AAAA", configurable: true });
      setTimeout(() => this.onload?.(new ProgressEvent("load") as unknown as ProgressEvent<FileReader>), 0);
    };

    const OriginalImage = globalThis.Image;
    class SuccessImage {
      onerror: (() => void) | null = null;
      onload: (() => void) | null = null;
      width = 3200; // latura lungă > maxSide (1600) -> scale 0.5
      height = 1600;
      set src(_value: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    // @ts-expect-error substituim global Image pentru test
    globalThis.Image = SuccessImage;

    const drawImageSpy = vi.fn();
    const toDataURLSpy = vi.fn().mockReturnValue("data:image/jpeg;base64,COMPRESSED");
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: drawImageSpy,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(toDataURLSpy);

    const result = await compressImage(file, 1600, 0.8);

    expect(result).toBe("data:image/jpeg;base64,COMPRESSED");
    expect(toDataURLSpy).toHaveBeenCalledWith("image/jpeg", 0.8);
    expect(drawImageSpy).toHaveBeenCalled();
    // scale = min(1, 1600/3200) = 0.5 -> canvas 1600x800
    const [, , , canvasWidth, canvasHeight] = drawImageSpy.mock.calls[0];
    expect(canvasWidth).toBe(1600);
    expect(canvasHeight).toBe(800);

    globalThis.Image = OriginalImage;
    FileReader.prototype.readAsDataURL = originalReadAsDataURL;
  });

  it("nu mărește o imagine mai mică decât maxSide (scale rămâne 1, Math.min(1, ...))", async () => {
    const file = makeFile();

    const originalReadAsDataURL = FileReader.prototype.readAsDataURL;
    FileReader.prototype.readAsDataURL = function (this: FileReader) {
      Object.defineProperty(this, "result", { value: "data:image/jpeg;base64,AAAA", configurable: true });
      setTimeout(() => this.onload?.(new ProgressEvent("load") as unknown as ProgressEvent<FileReader>), 0);
    };

    const OriginalImage = globalThis.Image;
    class SmallImage {
      onerror: (() => void) | null = null;
      onload: (() => void) | null = null;
      width = 400;
      height = 300;
      set src(_value: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    // @ts-expect-error substituim global Image pentru test
    globalThis.Image = SmallImage;

    const drawImageSpy = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: drawImageSpy,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,SMALL");

    const result = await compressImage(file, 1600, 0.8);

    expect(result).toBe("data:image/jpeg;base64,SMALL");
    const [, , , canvasWidth, canvasHeight] = drawImageSpy.mock.calls[0];
    expect(canvasWidth).toBe(400);
    expect(canvasHeight).toBe(300);

    globalThis.Image = OriginalImage;
    FileReader.prototype.readAsDataURL = originalReadAsDataURL;
  });
});
