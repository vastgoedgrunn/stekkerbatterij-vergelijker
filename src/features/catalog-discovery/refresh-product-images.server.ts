import "server-only";
import { repairProductImages, type ImageOsRepairRow } from "./image-os.server";

export {
  CURATED_PRODUCT_IMAGE_SOURCES,
  LOCAL_PRODUCT_IMAGE_PATHS,
} from "./product-image-sources";

export type ImageRefreshRow = ImageOsRepairRow;

/**
 * Image OS refresh: feeds → curated → page → heuristics → vision → Storage.
 * preferLocalAssets blijft voor admin-backward-compat; Image OS verifieert lokale
 * assets en haalt anders remote kandidaten op.
 */
export async function refreshAllProductImages(input?: {
  preferLocalAssets?: boolean;
}): Promise<{ updated: number; rows: ImageRefreshRow[] }> {
  void input?.preferLocalAssets;
  const result = await repairProductImages({ force: true });
  return { updated: result.repaired, rows: result.rows };
}
