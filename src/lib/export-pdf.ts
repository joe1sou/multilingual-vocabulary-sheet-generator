import "client-only";

export async function exportWorksheetPdf(element: HTMLElement, filename: string) {
  const [{ toPng }, { default: JsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);

  element.dataset.exporting = "true";
  let dataUrl: string;
  try {
    dataUrl = await toPng(element, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#ffffff",
      width: element.scrollWidth,
      height: element.scrollHeight,
      filter: (node) =>
        !(node instanceof HTMLElement && node.dataset.exportHide === "true"),
    });
  } finally {
    delete element.dataset.exporting;
  }

  const pdf = new JsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.addImage(dataUrl, "PNG", 0, 0, 297, 210, undefined, "FAST");
  pdf.save(`${filename}.pdf`);
}
