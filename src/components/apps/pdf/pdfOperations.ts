export const handleApplyWatermark = async (
  pdfBuffer: ArrayBuffer | null,
  watermarkText: string,
  watermarkFontSize: number,
  pdfFile: File | null
) => {
  if (!pdfBuffer || !watermarkText.trim()) return null;

  const { PDFDocument, rgb, degrees, StandardFonts } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 4,
      y: height / 2,
      size: watermarkFontSize,
      font,
      color: rgb(0.8, 0.1, 0.1),
      opacity: 0.35,
      rotate: degrees(45),
    });
  }

  const modifiedBytes = await pdfDoc.save();
  const blob = new Blob([modifiedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const newBuffer = await blob.arrayBuffer();

  const originalName = pdfFile ? pdfFile.name.replace(/\.pdf$/i, "") : "doc";
  const downloadName = `${originalName}_watermarked.pdf`;

  return { newBuffer, blob, downloadName };
};

export const handleMergePdfs = async (mergeFiles: File[]) => {
  if (mergeFiles.length < 2) return null;

  const { PDFDocument } = await import("pdf-lib");
  const mergedPdf = await PDFDocument.create();

  for (const file of mergeFiles) {
    const buffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((p) => mergedPdf.addPage(p));
  }

  const mergedBytes = await mergedPdf.save();
  const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const newBuffer = await blob.arrayBuffer();

  return { newBuffer, blob, downloadName: `merged_document_${Date.now()}.pdf` };
};

export const handleDeletePage = async (
  pdfBuffer: ArrayBuffer,
  pageIndex: number // 0-based
): Promise<{ newBuffer: ArrayBuffer } | null> => {
  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  if (pdfDoc.getPageCount() <= 1) return null;

  pdfDoc.removePage(pageIndex);
  const modifiedBytes = await pdfDoc.save();
  const blob = new Blob([modifiedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const newBuffer = await blob.arrayBuffer();
  return { newBuffer };
};

export interface JpgConvertOptions {
  scale: number; // e.g. 0.5 (50%), 0.75 (75%), 1.0 (100%), 1.5 (150%)
  resizeMode: "scale" | "width" | "height";
  customWidth?: number;
  customHeight?: number;
  quality: number; // 0.1 to 1.0 (e.g. 0.35, 0.65, 0.85, 0.95)
  backgroundColor?: string; // default "#ffffff"
}

export interface RenderedJpgResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  pageNum: number;
}

// Render a single PDF page to JPG Blob with resize & quality compression
export const renderPageToJpgBlob = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfDoc: any,
  pageNum: number,
  options: Partial<JpgConvertOptions> = {}
): Promise<RenderedJpgResult> => {
  const {
    scale = 1.0,
    resizeMode = "scale",
    customWidth,
    customHeight,
    quality = 0.8,
    backgroundColor = "#ffffff",
  } = options;

  const page = await pdfDoc.getPage(pageNum);
  const unscaledViewport = page.getViewport({ scale: 1.0 });

  let actualScale = scale;
  if (resizeMode === "width" && customWidth && customWidth > 0) {
    actualScale = customWidth / unscaledViewport.width;
  } else if (resizeMode === "height" && customHeight && customHeight > 0) {
    actualScale = customHeight / unscaledViewport.height;
  }

  const viewport = page.getViewport({ scale: actualScale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create 2D canvas context");

  // Paint white background (PDF pages can be transparent, JPG needs opaque background)
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTask = page.render({ canvasContext: ctx, viewport } as any);
  await renderTask.promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to generate JPG blob"));
          return;
        }
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve({
          blob,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
          sizeBytes: blob.size,
          pageNum,
        });
      },
      "image/jpeg",
      quality
    );
  });
};

// Download a single page directly as JPG
export const handleDownloadSinglePageJpg = async (
  pdfBuffer: ArrayBuffer,
  pageNum: number,
  options: Partial<JpgConvertOptions> = {},
  originalFileName?: string
): Promise<{ blob: Blob; downloadName: string; width: number; height: number; sizeBytes: number }> => {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const bufferCopy = pdfBuffer.slice(0);
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(bufferCopy),
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const result = await renderPageToJpgBlob(pdfDoc, pageNum, options);

  const baseName = originalFileName ? originalFileName.replace(/\.[^/.]+$/, "") : "document";
  const scaleTag = options.scale && options.scale !== 1.0 ? `_${Math.round(options.scale * 100)}p` : "";
  const downloadName = `${baseName}_hal_${pageNum}${scaleTag}.jpg`;

  const a = document.createElement("a");
  a.href = URL.createObjectURL(result.blob);
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);

  return {
    blob: result.blob,
    downloadName,
    width: result.width,
    height: result.height,
    sizeBytes: result.sizeBytes,
  };
};

// Download a single page directly as a standalone PDF
export const handleDownloadSinglePagePdf = async (
  pdfBuffer: ArrayBuffer,
  pageIndex: number, // 0-based
  originalFileName?: string
): Promise<{ blob: Blob; downloadName: string }> => {
  const { PDFDocument } = await import("pdf-lib");
  const sourcePdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const [copiedPage] = await newDoc.copyPages(sourcePdf, [pageIndex]);
  newDoc.addPage(copiedPage);

  const bytes = await newDoc.save();
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const baseName = originalFileName ? originalFileName.replace(/\.[^/.]+$/, "") : "document";
  const downloadName = `${baseName}_hal_${pageIndex + 1}.pdf`;

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);

  return { blob, downloadName };
};

// Batch convert PDF pages to JPG and download sequentially
export const handleConvertPdfToJpgBatch = async (
  pdfBuffer: ArrayBuffer,
  pdfFile: File | null,
  options: Partial<JpgConvertOptions> & {
    pagesToConvert: number[]; // 1-based page numbers
    onProgress?: (current: number, total: number, percent: number) => void;
  }
): Promise<Array<{ fileName: string; blob: Blob; pageNum: number }>> => {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const bufferCopy = pdfBuffer.slice(0);
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(bufferCopy),
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const baseName = pdfFile ? pdfFile.name.replace(/\.[^/.]+$/, "") : "document";
  const { pagesToConvert, onProgress, ...convertOpts } = options;

  const total = pagesToConvert.length;
  const convertedResults: Array<{ fileName: string; blob: Blob; pageNum: number }> = [];

  for (let i = 0; i < total; i++) {
    const pageNum = pagesToConvert[i];
    const res = await renderPageToJpgBlob(pdfDoc, pageNum, convertOpts);
    const fileName = `${baseName}_hal_${pageNum}.jpg`;
    convertedResults.push({ fileName, blob: res.blob, pageNum });

    if (onProgress) {
      const percent = Math.round(((i + 1) / total) * 100);
      onProgress(i + 1, total, percent);
    }

    // Trigger individual download with slight stagger
    const a = document.createElement("a");
    a.href = URL.createObjectURL(res.blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);

    if (i < total - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return convertedResults;
};

export const handleSplitPdf = async (
  pdfBuffer: ArrayBuffer,
  pdfFile: File | null,
  splitRanges: { start: number; end: number; label: string }[]
): Promise<void> => {
  const { PDFDocument } = await import("pdf-lib");
  const sourcePdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();
  const baseName = pdfFile ? pdfFile.name.replace(/\.pdf$/i, "") : "split";

  for (const range of splitRanges) {
    const newDoc = await PDFDocument.create();
    const startIdx = Math.max(0, range.start - 1);
    const endIdx = Math.min(totalPages - 1, range.end - 1);
    const indices = Array.from({ length: endIdx - startIdx + 1 }, (_, i) => startIdx + i);
    const copiedPages = await newDoc.copyPages(sourcePdf, indices);
    copiedPages.forEach((p) => newDoc.addPage(p));

    const bytes = await newDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${baseName}_${range.label}.pdf`;
    a.click();
    await new Promise((r) => setTimeout(r, 300));
  }
};

// Compress PDF by re-rendering pages as JPEG images at configurable quality/scale
// then packing them back into a new PDF document.
// renderScale: 0.5–1.5 (lower = smaller resolution = smaller file)
// jpegQuality: 0.1–1.0 (lower = more lossy = smaller file)
export const handleCompressPdf = async (
  pdfBuffer: ArrayBuffer,
  pdfFile: File | null,
  renderScale: number = 1.0,
  jpegQuality: number = 0.7,
  onProgress?: (current: number, total: number) => void
): Promise<{ blob: Blob; downloadName: string; originalSize: number; compressedSize: number }> => {
  // 1. Render pages via pdfjs-dist
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const bufferCopy = pdfBuffer.slice(0);
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(bufferCopy),
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  // 2. Create new pdf-lib document
  const { PDFDocument } = await import("pdf-lib");
  const newDoc = await PDFDocument.create();

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: renderScale });

    // Render to offscreen canvas
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

    // Convert canvas to JPEG
    const jpegDataUrl = canvas.toDataURL("image/jpeg", jpegQuality);
    const base64 = jpegDataUrl.split(",")[1];
    const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    // Embed JPEG into pdf-lib
    const jpgImage = await newDoc.embedJpg(imgBytes);
    const pdfPage = newDoc.addPage([canvas.width, canvas.height]);
    pdfPage.drawImage(jpgImage, { x: 0, y: 0, width: canvas.width, height: canvas.height });

    if (onProgress) onProgress(i, totalPages);
  }

  const bytes = await newDoc.save();
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const baseName = pdfFile ? pdfFile.name.replace(/\.[^/.]+$/, "") : "document";
  const downloadName = `${baseName}_compressed.pdf`;

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);

  return {
    blob,
    downloadName,
    originalSize: pdfBuffer.byteLength,
    compressedSize: bytes.byteLength,
  };
};
