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
