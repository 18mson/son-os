export const handleApplyWatermark = async (
  pdfBuffer: ArrayBuffer | null,
  watermarkText: string,
  watermarkFontSize: number,
  pdfFile: File | null
) => {
  if (!pdfBuffer || !watermarkText.trim()) return null;

  const { PDFDocument, rgb, degrees, StandardFonts } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.load(pdfBuffer);
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
    const pdf = await PDFDocument.load(buffer);
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
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  if (pdfDoc.getPageCount() <= 1) return null;

  pdfDoc.removePage(pageIndex);
  const modifiedBytes = await pdfDoc.save();
  const blob = new Blob([modifiedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const newBuffer = await blob.arrayBuffer();
  return { newBuffer };
};

export const handleSplitPdf = async (
  pdfBuffer: ArrayBuffer,
  pdfFile: File | null,
  splitRanges: { start: number; end: number; label: string }[]
): Promise<void> => {
  const { PDFDocument } = await import("pdf-lib");
  const sourcePdf = await PDFDocument.load(pdfBuffer);
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
