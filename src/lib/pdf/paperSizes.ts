/**
 * Paper Size Definitions and Conversion Utilities for PDF handling
 * 1 pt = 1/72 inch = 25.4/72 mm (~0.352778 mm)
 * 1 mm = 72/25.4 pt (~2.834646 pt)
 * 1 inch = 72 pt = 25.4 mm
 */

export const PT_PER_INCH = 72;
export const MM_PER_INCH = 25.4;
export const PT_PER_MM = PT_PER_INCH / MM_PER_INCH; // ~2.8346456692913384

export interface PaperStandardSize {
  id: string;
  name: string;
  category: "ISO" | "US" | "Other";
  widthMm: number;
  heightMm: number;
  widthPt: number;
  heightPt: number;
  description?: string;
}

export const STANDARD_PAPER_SIZES: PaperStandardSize[] = [
  {
    id: "a4",
    name: "A4",
    category: "ISO",
    widthMm: 210,
    heightMm: 297,
    widthPt: 595.28,
    heightPt: 841.89,
    description: "Standard document format (210 × 297 mm)",
  },
  {
    id: "a3",
    name: "A3",
    category: "ISO",
    widthMm: 297,
    heightMm: 420,
    widthPt: 841.89,
    heightPt: 1190.55,
    description: "Large poster & drawings (297 × 420 mm)",
  },
  {
    id: "a2",
    name: "A2",
    category: "ISO",
    widthMm: 420,
    heightMm: 594,
    widthPt: 1190.55,
    heightPt: 1683.78,
    description: "Medium poster format (420 × 594 mm)",
  },
  {
    id: "a1",
    name: "A1",
    category: "ISO",
    widthMm: 594,
    heightMm: 841,
    widthPt: 1683.78,
    heightPt: 2383.94,
    description: "Architectural & technical drawings (594 × 841 mm)",
  },
  {
    id: "a5",
    name: "A5",
    category: "ISO",
    widthMm: 148,
    heightMm: 210,
    widthPt: 419.53,
    heightPt: 595.28,
    description: "Booklets & flyers (148 × 210 mm)",
  },
  {
    id: "letter",
    name: "Letter",
    category: "US",
    widthMm: 215.9,
    heightMm: 279.4,
    widthPt: 612.0,
    heightPt: 792.0,
    description: "US standard letter (8.5 × 11 in)",
  },
  {
    id: "legal",
    name: "Legal",
    category: "US",
    widthMm: 215.9,
    heightMm: 355.6,
    widthPt: 612.0,
    heightPt: 1008.0,
    description: "US legal document (8.5 × 14 in)",
  },
  {
    id: "tabloid",
    name: "Tabloid",
    category: "US",
    widthMm: 279.4,
    heightMm: 431.8,
    widthPt: 792.0,
    heightPt: 1224.0,
    description: "US Tabloid / Ledger (11 × 17 in)",
  },
  {
    id: "b5",
    name: "B5 (ISO)",
    category: "ISO",
    widthMm: 176,
    heightMm: 250,
    widthPt: 498.9,
    heightPt: 708.66,
    description: "ISO B5 notebook size (176 × 250 mm)",
  },
];

export type Orientation = "portrait" | "landscape" | "square";
export type TargetOrientation = "portrait" | "landscape" | "match_original";
export type ConversionMode = "fit" | "stretch" | "crop_pad" | "tile_split";
export type TileOutputMode = "single_pdf" | "separate_files";
export type SizeUnit = "mm" | "inch" | "pt";

export interface TileGridInfo {
  cols: number;
  rows: number;
  totalTiles: number;
  tileWidthPt: number;
  tileHeightPt: number;
  overlapPt: number;
  targetMarginPt?: number;
  usableWidthPt?: number;
  usableHeightPt?: number;
  hasPartialTiles: boolean;
  partialCols: boolean;
  partialRows: boolean;
}

/**
 * Calculate grid dimensions for poster/tile splitting
 */
export function calculateTileGrid(
  sourceWidthPt: number,
  sourceHeightPt: number,
  targetWidthPt: number,
  targetHeightPt: number,
  overlapPt = 0,
  targetMarginPt = 0
): TileGridInfo {
  const usableTargetW = Math.max(10, targetWidthPt - 2 * targetMarginPt);
  const usableTargetH = Math.max(10, targetHeightPt - 2 * targetMarginPt);

  const effectiveStepW = Math.max(10, usableTargetW - overlapPt);
  const effectiveStepH = Math.max(10, usableTargetH - overlapPt);

  const cols = Math.max(1, Math.ceil((sourceWidthPt - overlapPt) / effectiveStepW));
  const rows = Math.max(1, Math.ceil((sourceHeightPt - overlapPt) / effectiveStepH));
  const totalTiles = cols * rows;

  const partialCols = (cols - 1) * effectiveStepW + usableTargetW > sourceWidthPt + 1.5;
  const partialRows = (rows - 1) * effectiveStepH + usableTargetH > sourceHeightPt + 1.5;

  return {
    cols,
    rows,
    totalTiles,
    tileWidthPt: targetWidthPt,
    tileHeightPt: targetHeightPt,
    overlapPt,
    targetMarginPt,
    usableWidthPt: usableTargetW,
    usableHeightPt: usableTargetH,
    hasPartialTiles: partialCols || partialRows,
    partialCols,
    partialRows,
  };
}



export interface PageDimensionInfo {
  pageNumber: number; // 1-indexed
  rawWidthPt: number;
  rawHeightPt: number;
  rotation: number; // 0, 90, 180, 270
  visualWidthPt: number;
  visualHeightPt: number;
  visualWidthMm: number;
  visualHeightMm: number;
  orientation: Orientation;
  detectedName: string;
  isStandard: boolean;
  standardId?: string;
}

export interface DocumentSummaryInfo {
  pageCount: number;
  pages: PageDimensionInfo[];
  isUniform: boolean;
  dominantName: string;
  summaryLabel: string;
}

/**
 * Unit conversions
 */
export function mmToPt(mm: number): number {
  return Number((mm * PT_PER_MM).toFixed(2));
}

export function ptToMm(pt: number): number {
  return Number((pt / PT_PER_MM).toFixed(1));
}

export function inchToPt(inch: number): number {
  return Number((inch * PT_PER_INCH).toFixed(2));
}

export function ptToInch(pt: number): number {
  return Number((pt / PT_PER_INCH).toFixed(2));
}

export function convertDimension(val: number, from: SizeUnit, to: SizeUnit): number {
  let ptVal = val;
  if (from === "mm") ptVal = mmToPt(val);
  else if (from === "inch") ptVal = inchToPt(val);

  if (to === "mm") return ptToMm(ptVal);
  if (to === "inch") return ptToInch(ptVal);
  return Number(ptVal.toFixed(2));
}

/**
 * Identify paper size from width & height points with ±3.5pt tolerance
 */
export function matchStandardSize(
  widthPt: number,
  heightPt: number,
  tolerance = 3.5
): { standard: PaperStandardSize; orientation: Orientation } | null {
  const minDim = Math.min(widthPt, heightPt);
  const maxDim = Math.max(widthPt, heightPt);
  const orientation: Orientation =
    Math.abs(widthPt - heightPt) < 1 ? "square" : widthPt > heightPt ? "landscape" : "portrait";

  for (const std of STANDARD_PAPER_SIZES) {
    const stdMin = Math.min(std.widthPt, std.heightPt);
    const stdMax = Math.max(std.widthPt, std.heightPt);

    if (Math.abs(minDim - stdMin) <= tolerance && Math.abs(maxDim - stdMax) <= tolerance) {
      return { standard: std, orientation };
    }
  }

  return null;
}

/**
 * Inspect page dimensions considering rotation
 */
export function inspectPageDimension(
  pageNumber: number,
  rawWidthPt: number,
  rawHeightPt: number,
  rotation = 0
): PageDimensionInfo {
  const normRotation = ((rotation % 360) + 360) % 360;
  const isRotated90or270 = normRotation === 90 || normRotation === 270;

  const visualWidthPt = isRotated90or270 ? rawHeightPt : rawWidthPt;
  const visualHeightPt = isRotated90or270 ? rawWidthPt : rawHeightPt;

  const visualWidthMm = ptToMm(visualWidthPt);
  const visualHeightMm = ptToMm(visualHeightPt);

  const orientation: Orientation =
    Math.abs(visualWidthPt - visualHeightPt) < 2
      ? "square"
      : visualWidthPt > visualHeightPt
      ? "landscape"
      : "portrait";

  const match = matchStandardSize(visualWidthPt, visualHeightPt);

  let detectedName: string;
  let isStandard = false;
  let standardId: string | undefined;

  if (match) {
    detectedName = match.standard.name;
    isStandard = true;
    standardId = match.standard.id;
  } else {
    detectedName = `Custom (${visualWidthMm} × ${visualHeightMm} mm)`;
  }

  return {
    pageNumber,
    rawWidthPt,
    rawHeightPt,
    rotation: normRotation,
    visualWidthPt,
    visualHeightPt,
    visualWidthMm,
    visualHeightMm,
    orientation,
    detectedName,
    isStandard,
    standardId,
  };
}

/**
 * Analyze all pages in a document
 */
export function analyzeDocumentDimensions(
  pages: Array<{ width: number; height: number; rotation?: number }>
): DocumentSummaryInfo {
  const pageInfos = pages.map((p, idx) =>
    inspectPageDimension(idx + 1, p.width, p.height, p.rotation || 0)
  );

  const sizeCounts: Record<string, number> = {};
  for (const p of pageInfos) {
    const key = `${p.detectedName} (${p.orientation})`;
    sizeCounts[key] = (sizeCounts[key] || 0) + 1;
  }

  const distinctSizes = Object.keys(sizeCounts);
  const isUniform = distinctSizes.length <= 1;

  // Find dominant name
  let dominantName = pageInfos[0]?.detectedName || "Unknown";
  let maxCount = 0;
  for (const [name, count] of Object.entries(sizeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantName = name;
    }
  }

  let summaryLabel = "";
  if (isUniform) {
    summaryLabel = `${pageInfos[0]?.detectedName || "Standard"} (${pageInfos.length} ${
      pageInfos.length === 1 ? "page" : "pages"
    })`;
  } else {
    summaryLabel = `Mixed (${distinctSizes.map((k) => `${sizeCounts[k]}× ${k}`).join(", ")})`;
  }

  return {
    pageCount: pageInfos.length,
    pages: pageInfos,
    isUniform,
    dominantName,
    summaryLabel,
  };
}
