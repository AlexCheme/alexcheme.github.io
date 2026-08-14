import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;

  // Extract all unique headers across all rows to guarantee aligned columns
  const headersSet = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((k) => headersSet.add(k));
  });
  const headers = Array.from(headersSet);

  const formatCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    if (typeof val === 'object') {
      val = Array.isArray(val) ? val.join('; ') : JSON.stringify(val);
    }
    // Clean string by replacing raw newlines/returns with space so row boundaries aren't broken
    const str = String(val).replace(/[\r\n]+/g, ' ').replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(formatCell).join(',');
  const dataRows = rows.map((row) =>
    headers.map((h) => formatCell(row[h] ?? '')).join(',')
  );

  // 'sep=,' instructs Microsoft Excel explicitly to parse comma as delimiter
  // Prepend UTF-8 BOM (\uFEFF) to preserve international characters
  const csvContent = 'sep=,\r\n\uFEFF' + [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrint() {
  try {
    window.print();
  } catch (err) {
    console.warn('Window print execution safe fallback:', err);
  }
}

// Convert modern CSS color functions (oklch, oklab, light-dark, lab, lch) to safe rgb/hex format
function sanitizeColorString(cssText: string, ctx?: CanvasRenderingContext2D | null): string {
  if (!cssText) return cssText;
  if (!/(?:oklab|oklch|lab|lch|light-dark|color)\s*\(/i.test(cssText)) {
    return cssText;
  }

  const canvasCtx = ctx || (typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null);

  return cssText.replace(/(?:oklab|oklch|lab|lch|light-dark|color)\s*\((?:[^()]*|\([^()]*\))*\)/gi, (match) => {
    if (!canvasCtx) return '#64748b';
    try {
      canvasCtx.fillStyle = '#000000';
      canvasCtx.fillStyle = match;
      const res = canvasCtx.fillStyle;
      if (res && res !== '#000000' && !res.includes('oklch') && !res.includes('oklab')) {
        return res;
      }
      canvasCtx.fillStyle = '#ffffff';
      canvasCtx.fillStyle = match;
      const resWhite = canvasCtx.fillStyle;
      if (resWhite && resWhite !== '#ffffff' && !resWhite.includes('oklch') && !resWhite.includes('oklab')) {
        return resWhite;
      }
      if (match.toLowerCase().includes('black') || match.includes(' 0 0 0')) {
        return '#000000';
      }
    } catch {
      // Fallback
    }
    return '#64748b';
  });
}

// Convert image src to base64 Data URI to avoid CORS canvas tainting
async function imageToDataUri(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 100;
        canvas.height = img.naturalHeight || img.height || 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
          return;
        }
      } catch {
        // Canvas tainted or blocked
      }
      resolve('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f1f5f9"/></svg>');
    };

    img.onerror = async () => {
      try {
        const response = await fetch(url, { mode: 'cors' });
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            resolve('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f1f5f9"/></svg>');
          }
        };
        reader.onerror = () => resolve('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f1f5f9"/></svg>');
        reader.readAsDataURL(blob);
      } catch {
        resolve('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f1f5f9"/></svg>');
      }
    };

    img.src = url;
  });
}

function applyComputedStyles(sourceNode: HTMLElement, targetNode: HTMLElement, canvasCtx: CanvasRenderingContext2D | null) {
  try {
    const computed = window.getComputedStyle(sourceNode);
    const style = targetNode.style;

    // Colors & Backgrounds
    style.color = sanitizeColorString(computed.color, canvasCtx);
    style.backgroundColor = sanitizeColorString(computed.backgroundColor, canvasCtx);
    style.borderColor = sanitizeColorString(computed.borderColor, canvasCtx);
    style.borderTopColor = sanitizeColorString(computed.borderTopColor, canvasCtx);
    style.borderRightColor = sanitizeColorString(computed.borderRightColor, canvasCtx);
    style.borderBottomColor = sanitizeColorString(computed.borderBottomColor, canvasCtx);
    style.borderLeftColor = sanitizeColorString(computed.borderLeftColor, canvasCtx);

    if (computed.fill) style.fill = sanitizeColorString(computed.fill, canvasCtx);
    if (computed.stroke) style.stroke = sanitizeColorString(computed.stroke, canvasCtx);

    if (computed.backgroundImage && computed.backgroundImage !== 'none') {
      style.backgroundImage = sanitizeColorString(computed.backgroundImage, canvasCtx);
    }
    if (computed.boxShadow && computed.boxShadow !== 'none') {
      style.boxShadow = sanitizeColorString(computed.boxShadow, canvasCtx);
    }

    // Layout & Box Model
    style.display = computed.display === 'none' ? 'block' : computed.display;
    style.flexDirection = computed.flexDirection;
    style.justifyContent = computed.justifyContent;
    style.alignItems = computed.alignItems;
    style.gap = computed.gap;
    style.padding = computed.padding;
    style.margin = computed.margin;
    style.boxSizing = computed.boxSizing;

    // Typography
    style.fontFamily = computed.fontFamily;
    style.fontSize = computed.fontSize;
    style.fontWeight = computed.fontWeight;
    style.lineHeight = computed.lineHeight;
    style.letterSpacing = computed.letterSpacing;
    style.textAlign = computed.textAlign;
    style.textTransform = computed.textTransform;

    // Borders & Radius
    style.borderRadius = computed.borderRadius;
    style.borderStyle = computed.borderStyle;
    style.borderWidth = computed.borderWidth;
    style.opacity = computed.opacity;
  } catch {
    // Ignore detached nodes safely
  }

  const sourceChildren = Array.from(sourceNode.children);
  const targetChildren = Array.from(targetNode.children);

  for (let i = 0; i < sourceChildren.length; i++) {
    if (sourceChildren[i] instanceof HTMLElement && targetChildren[i] instanceof HTMLElement) {
      applyComputedStyles(sourceChildren[i] as HTMLElement, targetChildren[i] as HTMLElement, canvasCtx);
    }
  }
}

export async function exportToPDF(elementOrId: string | HTMLElement, filename: string) {
  const target = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!target) {
    console.warn('PDF export target element not found:', elementOrId);
    return;
  }

  const canvasCtx = document.createElement('canvas').getContext('2d');

  // Create an off-screen container in the DOM
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-9999px';
  container.style.width = '850px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';

  const clone = target.cloneNode(true) as HTMLElement;
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.classList.remove('hidden');

  // Ensure all child elements inside clone are visible
  const hiddenChildren = clone.querySelectorAll('.hidden');
  hiddenChildren.forEach((child) => {
    if (child instanceof HTMLElement) {
      child.classList.remove('hidden');
      if (child.style.display === 'none') {
        child.style.display = 'block';
      }
    }
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  // Explicitly apply computed styles from original element onto clone
  applyComputedStyles(target, clone, canvasCtx);

  try {
    // Process images inside clone to inline Data URIs to prevent cross-origin canvas tainting
    const images = Array.from(clone.querySelectorAll<HTMLImageElement>('img'));
    await Promise.all(
      images.map(async (img) => {
        if (!img.src) return;
        const dataUri = await imageToDataUri(img.src);
        img.src = dataUri;
      })
    );

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc, clonedElement) => {
        try {
          // 1. Remove all <style> and <link> tags from clonedDoc so html2canvas never parses raw CSS containing oklab/oklch
          const stylesAndLinks = Array.from(clonedDoc.querySelectorAll('style, link[rel="stylesheet"], link[as="style"]'));
          stylesAndLinks.forEach((el) => el.remove());

          // 2. Sanitize any inline style attributes on cloned nodes
          const allNodes = [clonedElement, ...Array.from(clonedElement.querySelectorAll('*'))];
          allNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const inlineStyle = node.getAttribute('style');
              if (inlineStyle && /(?:oklab|oklch|lab|lch|light-dark|color)\s*\(/i.test(inlineStyle)) {
                node.setAttribute('style', sanitizeColorString(inlineStyle, canvasCtx));
              }
            }
          });
        } catch (e) {
          console.warn('HTML2Canvas onclone sanitization warning:', e);
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    if (contentHeight <= pdfHeight - margin * 2) {
      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);
    } else {
      let heightLeft = contentHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= (pdfHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - contentHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
        heightLeft -= (pdfHeight - margin * 2);
      }
    }

    const cleanName = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    // Trigger reliable browser download via Blob URL
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = cleanName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);

  } catch (err) {
    console.error('PDF export failed:', err);
    try {
      window.print();
    } catch {}
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount || 0);
  return `${formatted} ETB`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getBeltBadgeClass(belt: string): string {
  switch (belt) {
    case 'White':
      return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700';
    case 'Yellow Stripe':
      return 'bg-yellow-50 text-yellow-900 border-yellow-400 dark:bg-yellow-950/60 dark:text-yellow-200 dark:border-yellow-600 font-medium';
    case 'Yellow':
      return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700 font-semibold';
    case 'Green Stripe':
      return 'bg-emerald-50 text-emerald-900 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-600 font-medium';
    case 'Green':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700 font-semibold';
    case 'Blue Stripe':
      return 'bg-blue-50 text-blue-900 border-blue-400 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-600 font-medium';
    case 'Blue':
      return 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700 font-semibold';
    case 'Brown Stripe':
      return 'bg-amber-900/10 text-amber-950 border-amber-800/40 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700 font-medium';
    case 'Brown':
      return 'bg-amber-900/20 text-amber-950 border-amber-800 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-600 font-semibold';
    case 'Red Stripe':
      return 'bg-rose-50 text-rose-900 border-rose-400 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-600 font-medium';
    case 'Red':
      return 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700 font-semibold';
    case 'Black Stripe':
      return 'bg-slate-800 text-amber-300 border-amber-500/40 dark:bg-slate-900 dark:text-amber-200 font-medium';
    case 'Black':
      return 'bg-slate-950 text-amber-400 border-amber-500 dark:bg-black dark:text-amber-300 font-bold shadow-sm';
    default:
      // Dan ranks (1st Dan, 2nd Dan...)
      return 'bg-slate-950 text-amber-400 border-amber-500 dark:bg-black dark:text-amber-300 shadow-sm font-black';
  }
}

