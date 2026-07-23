/**
 * Comprimă o poză (de regulă din camera telefonului, 3–8 MB brute) înainte de a o encoda ca data URI —
 * redimensionare la max `maxSide` px pe latura lungă + reencodare JPEG la `quality`, ca payload-ul (stocat
 * ca text/JSONB, ca la `Item.imageUrl`/`Offer.images`) să nu umfle nerezonabil DB-ul. Rezultat tipic: sub
 * 400 KB/poză. Folosită din comparator (`OfferFormDrawer`) și galeria de inspirație (`GalleryFormDrawer`).
 */
export function compressImage(file: File, maxSide = 1600, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nu am putut citi fișierul"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Nu am putut încărca imaginea"));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas indisponibil"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
