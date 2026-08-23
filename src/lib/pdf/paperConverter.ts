import {
  ConversionMode,
  TargetOrientation,
  TileOutputMode,
  TileGridInfo,
  calculateTileGrid,
  STANDARD_PAPER_SIZES,
  ptToMm,
  mmToPt,
  inspectPageDimension,
  PageDimensionInfo,
} from "./paperSizes";

export interface ConvertPdfOptions {
  targetStandardId?: string; // e.g. "a4", "letter"
  customWidthPt?: number;
  customHeightPt?: number;
  targetOrientation: TargetOrientation;
  mode: ConversionMode;
  tileOutputMode?: TileOutputMode;
  overlapMm?: number;
  targetMarginMm?: number;
  pageScope: "all" | "range";
  pageRange?: string; // e.g. "1-5, 8"
  onProgress?: (current: number, total: number, percent: number) => void;
}

export interface TileGeneratedFile {
  fileName: string;
  blob: Blob;
  newBuffer: ArrayBuffer;
  pageNumber: number;
  row: number;
  col: number;
}

export interface ConvertPdfResult {
  newBuffer: ArrayBuffer;
  blob: Blob;
  fileName: string;
  totalPages: number;
  targetSizeLabel: string;
  modeLabel: string;
  tileFiles?: TileGeneratedFile[];
  tileGrid?: TileGridInfo;
}


/**
 * Parse page ranges string like "1, 3-5, 8" into a 1-based page number array
 */
export function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr.trim()) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pagesSet = new Set<number>();
  const parts = rangeStr.split(",");

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let p = min; p <= max; p++) {
          pagesSet.add(p);
        }
      }
    } else {
      const pageNum = parseInt(trimmed, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pagesSet.add(pageNum);
      }
    }
  }

  const result = Array.from(pagesSet).sort((a, b) => a - b);
  return result.length > 0 ? result : Array.from({ length: totalPages }, (_, i) => i + 1);
}

/**
 * Calculate target page width & height in points given options and original page orientation
 */
export function getTargetDimensionsPt(
  options: ConvertPdfOptions,
  sourcePageInfo: PageDimensionInfo
): { targetWidthPt: number; targetHeightPt: number; targetName: string } {
  let baseWidthPt: number;
  let baseHeightPt: number;
  let targetName: string;

  if (options.targetStandardId && options.targetStandardId !== "custom") {
    const std = STANDARD_PAPER_SIZES.find((s) => s.id === options.targetStandardId) || STANDARD_PAPER_SIZES[0];
    baseWidthPt = Math.min(std.widthPt, std.heightPt); // Portrait base
    baseHeightPt = Math.max(std.widthPt, std.heightPt);
    targetName = std.name;
  } else {
    const w = options.customWidthPt || mmToPt(210);
    const h = options.customHeightPt || mmToPt(297);
    baseWidthPt = Math.min(w, h);
    baseHeightPt = Math.max(w, h);
    targetName = `Custom (${ptToMm(w)}×${ptToMm(h)} mm)`;
  }

  // Determine final target orientation
  let isTargetLandscape = false;
  if (options.targetOrientation === "landscape") {
    isTargetLandscape = true;
  } else if (options.targetOrientation === "portrait") {
    isTargetLandscape = false;
  } else {
    // "match_original"
    isTargetLandscape = sourcePageInfo.orientation === "landscape";
  }

  const targetWidthPt = isTargetLandscape ? baseHeightPt : baseWidthPt;
  const targetHeightPt = isTargetLandscape ? baseWidthPt : baseHeightPt;

  return { targetWidthPt, targetHeightPt, targetName };
}

/**
 * Compute transform parameters (x, y, scaleX, scaleY) for drawing embedded page
 * with optional print margin inset.
 */
export function computeTransform(
  mode: ConversionMode,
  embeddedWidth: number,
  embeddedHeight: number,
  targetWidth: number,
  targetHeight: number,
  margin = 0
): { x: number; y: number; xScale: number; yScale: number } {
  const usableW = Math.max(10, targetWidth - 2 * margin);
  const usableH = Math.max(10, targetHeight - 2 * margin);

  if (mode === "stretch") {
    const xScale = usableW / embeddedWidth;
    const yScale = usableH / embeddedHeight;
    return { x: margin, y: margin, xScale, yScale };
  }

  if (mode === "crop_pad") {
    // 1:1 scale, centered in usable printable area
    const x = margin + (usableW - embeddedWidth) / 2;
    const y = margin + (usableH - embeddedHeight) / 2;
    return { x, y, xScale: 1, yScale: 1 };
  }

  // Default: "fit" (proportional scaling within usable printable area)
  const scale = Math.min(usableW / embeddedWidth, usableH / embeddedHeight);
  const renderedWidth = embeddedWidth * scale;
  const renderedHeight = embeddedHeight * scale;
  const x = margin + (usableW - renderedWidth) / 2;
  const y = margin + (usableH - renderedHeight) / 2;

  return { x, y, xScale: scale, yScale: scale };
}

/**
 * Convert PDF pages to target size and mode
 */
export async function convertPdfPaperSize(
  pdfBuffer: ArrayBuffer,
  originalFileName: string,
  options: ConvertPdfOptions
): Promise<ConvertPdfResult> {
  const { PDFDocument, degrees } = await import("pdf-lib");

  // Load source document
  const sourceDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: false });
  const totalPages = sourceDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error("Dokumen PDF tidak memiliki halaman.");
  }

  // Create target document
  const targetDoc = await PDFDocument.create();

  // Determine pages to process
  const targetPageIndices =
    options.pageScope === "range" && options.pageRange
      ? parsePageRangeString(options.pageRange, totalPages).map((p) => p - 1)
      : Array.from({ length: totalPages }, (_, i) => i);

  let targetSizeLabel = "";
  const targetMarginPt = mmToPt(options.targetMarginMm || 0);

  // Embed source pages into target document
  const tileFiles: TileGeneratedFile[] = [];
  let totalProcessedItems = 0;
  let lastGrid: TileGridInfo | undefined;

  for (let i = 0; i < targetPageIndices.length; i++) {
    const pageIndex = targetPageIndices[i];
    const sourcePage = sourceDoc.getPage(pageIndex);
    const rawSize = sourcePage.getSize();
    const rotationAngle = sourcePage.getRotation().angle;

    const pageInfo = inspectPageDimension(pageIndex + 1, rawSize.width, rawSize.height, rotationAngle);
    const { targetWidthPt, targetHeightPt, targetName } = getTargetDimensionsPt(options, pageInfo);
    if (!targetSizeLabel) targetSizeLabel = targetName;

    // Embed the source page
    const embeddedPage = await targetDoc.embedPage(sourcePage);
    const normRotation = ((rotationAngle % 360) + 360) % 360;

    let visualEmbeddedW = embeddedPage.width;
    let visualEmbeddedH = embeddedPage.height;
    if (normRotation === 90 || normRotation === 270) {
      visualEmbeddedW = embeddedPage.height;
      visualEmbeddedH = embeddedPage.width;
    }

    if (options.mode === "tile_split") {
      const overlapPt = mmToPt(options.overlapMm || 0);
      const grid = calculateTileGrid(visualEmbeddedW, visualEmbeddedH, targetWidthPt, targetHeightPt, overlapPt, targetMarginPt);
      lastGrid = grid;

      const usableTargetW = grid.usableWidthPt ?? (targetWidthPt - 2 * targetMarginPt);
      const usableTargetH = grid.usableHeightPt ?? (targetHeightPt - 2 * targetMarginPt);
      const stepW = usableTargetW - overlapPt;
      const stepH = usableTargetH - overlapPt;

      for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
          const x = targetMarginPt - col * stepW;
          const y = targetMarginPt - (grid.rows - 1 - row) * stepH;

          // 1. Add to combined document
          const tilePage = targetDoc.addPage([targetWidthPt, targetHeightPt]);

          if (normRotation === 0) {
            tilePage.drawPage(embeddedPage, { x, y, xScale: 1, yScale: 1 });
          } else if (normRotation === 90) {
            tilePage.drawPage(embeddedPage, {
              x: x + visualEmbeddedW,
              y,
              xScale: 1,
              yScale: 1,
              rotate: degrees(90),
            });
          } else if (normRotation === 180) {
            tilePage.drawPage(embeddedPage, {
              x: x + visualEmbeddedW,
              y: y + visualEmbeddedH,
              xScale: 1,
              yScale: 1,
              rotate: degrees(180),
            });
          } else if (normRotation === 270) {
            tilePage.drawPage(embeddedPage, {
              x,
              y: y + visualEmbeddedH,
              xScale: 1,
              yScale: 1,
              rotate: degrees(270),
            });
          }

          // 2. If separate files requested, generate individual single-page PDF
          if (options.tileOutputMode === "separate_files") {
            const singleTileDoc = await PDFDocument.create();
            const singleEmbedded = await singleTileDoc.embedPage(sourcePage);
            const stPage = singleTileDoc.addPage([targetWidthPt, targetHeightPt]);

            if (normRotation === 0) {
              stPage.drawPage(singleEmbedded, { x, y, xScale: 1, yScale: 1 });
            } else if (normRotation === 90) {
              stPage.drawPage(singleEmbedded, {
                x: x + visualEmbeddedW,
                y,
                xScale: 1,
                yScale: 1,
                rotate: degrees(90),
              });
            } else if (normRotation === 180) {
              stPage.drawPage(singleEmbedded, {
                x: x + visualEmbeddedW,
                y: y + visualEmbeddedH,
                xScale: 1,
                yScale: 1,
                rotate: degrees(180),
              });
            } else if (normRotation === 270) {
              stPage.drawPage(singleEmbedded, {
                x,
                y: y + visualEmbeddedH,
                xScale: 1,
                yScale: 1,
                rotate: degrees(270),
              });
            }

            const stBytes = await singleTileDoc.save();
            const stBlob = new Blob([stBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const stBuffer = await stBlob.arrayBuffer();

            const baseName = originalFileName.replace(/\.pdf$/i, "");
            const cleanTarget = targetSizeLabel.replace(/[^a-zA-Z0-9_-]/g, "_");
            const stFileName = `${baseName}_${cleanTarget}_p${pageIndex + 1}_r${row + 1}c${col + 1}.pdf`;

            tileFiles.push({
              fileName: stFileName,
              blob: stBlob,
              newBuffer: stBuffer,
              pageNumber: pageIndex + 1,
              row: row + 1,
              col: col + 1,
            });
          }

          totalProcessedItems++;
          if (options.onProgress) {
            const totalEstimated = targetPageIndices.length * grid.totalTiles;
            const percent = Math.min(100, Math.round((totalProcessedItems / totalEstimated) * 100));
            options.onProgress(totalProcessedItems, totalEstimated, percent);
          }
        }
      }
    } else {
      // Standard Modes: Fit, Stretch, Crop & Pad
      const newPage = targetDoc.addPage([targetWidthPt, targetHeightPt]);

      const { x, y, xScale, yScale } = computeTransform(
        options.mode,
        visualEmbeddedW,
        visualEmbeddedH,
        targetWidthPt,
        targetHeightPt,
        targetMarginPt
      );

      // Draw the embedded page with its natural rotation
      if (normRotation === 0) {
        newPage.drawPage(embeddedPage, {
          x,
          y,
          xScale,
          yScale,
        });
      } else if (normRotation === 90) {
        newPage.drawPage(embeddedPage, {
          x: x + visualEmbeddedW * xScale,
          y,
          xScale,
          yScale,
          rotate: degrees(90),
        });
      } else if (normRotation === 180) {
        newPage.drawPage(embeddedPage, {
          x: x + visualEmbeddedW * xScale,
          y: y + visualEmbeddedH * yScale,
          xScale,
          yScale,
          rotate: degrees(180),
        });
      } else if (normRotation === 270) {
        newPage.drawPage(embeddedPage, {
          x,
          y: y + visualEmbeddedH * yScale,
          xScale,
          yScale,
          rotate: degrees(270),
        });
      }

      totalProcessedItems++;
      if (options.onProgress) {
        const current = i + 1;
        const total = targetPageIndices.length;
        const percent = Math.round((current / total) * 100);
        options.onProgress(current, total, percent);
      }
    }
  }

  // Generate output bytes
  const modifiedBytes = await targetDoc.save();
  const blob = new Blob([modifiedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const newBuffer = await blob.arrayBuffer();

  const baseName = originalFileName.replace(/\.pdf$/i, "");
  const cleanTargetName = targetSizeLabel.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${baseName}_${cleanTargetName}_${options.mode}.pdf`;

  const modeLabels: Record<ConversionMode, string> = {
    fit: "Fit (Proportional)",
    stretch: "Stretch",
    crop_pad: "Crop & Pad (1:1)",
    tile_split: "Tile / Split (Poster Grid)",
  };

  return {
    newBuffer,
    blob,
    fileName,
    totalPages: targetDoc.getPageCount(),
    targetSizeLabel,
    modeLabel: modeLabels[options.mode],
    tileFiles: tileFiles.length > 0 ? tileFiles : undefined,
    tileGrid: lastGrid,
  };
}

