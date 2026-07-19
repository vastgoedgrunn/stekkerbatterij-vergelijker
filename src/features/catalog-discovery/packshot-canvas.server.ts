import "server-only";
import sharp from "sharp";

/** Card-vriendelijk canvas (4:3), past ook op vierkante PDP met object-contain. */
export const PACKSHOT_WIDTH = 1200;
export const PACKSHOT_HEIGHT = 900;

/** Product vult ~82% van het canvas; nooit crop, altijd volledig zichtbaar. */
const FILL_RATIO = 0.82;

/** Lichte frame-kleur, dicht bij site muted/accent. */
const CANVAS_BG = { r: 245, g: 247, b: 246 };

export type PackshotResult = {
  buffer: Buffer;
  contentType: "image/jpeg";
  width: number;
  height: number;
};

/**
 * Normeert een productfoto naar een uniform packshot-canvas:
 * trim overtollige witruimte → schaal met fit=inside (geen crop) → centreer op canvas.
 * Het object valt nooit buiten de kaders.
 */
export async function normalizeToPackshotCanvas(input: Buffer): Promise<PackshotResult> {
  let working = input;

  try {
    const trimmed = await sharp(input)
      .trim({
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        threshold: 18,
      })
      .toBuffer();
    if (trimmed.byteLength > 1024) working = trimmed;
  } catch {
    // Trim faalt bij complexe achtergronden; gebruik origineel.
  }

  const maxW = Math.round(PACKSHOT_WIDTH * FILL_RATIO);
  const maxH = Math.round(PACKSHOT_HEIGHT * FILL_RATIO);

  const resized = await sharp(working)
    .resize(maxW, maxH, {
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  const buffer = await sharp({
    create: {
      width: PACKSHOT_WIDTH,
      height: PACKSHOT_HEIGHT,
      channels: 3,
      background: CANVAS_BG,
    },
  })
    .composite([{ input: resized, gravity: "centre" }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  return {
    buffer,
    contentType: "image/jpeg",
    width: PACKSHOT_WIDTH,
    height: PACKSHOT_HEIGHT,
  };
}
