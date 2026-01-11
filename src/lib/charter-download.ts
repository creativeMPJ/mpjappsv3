/**
 * Charter Download Utility
 * Uses html2canvas to capture and download VirtualCharter as JPG
 */
import html2canvas from "html2canvas";

interface DownloadOptions {
  filename?: string;
  quality?: number;
  scale?: number;
}

/**
 * Capture an HTML element and download as JPG
 * @param element - The HTML element to capture
 * @param options - Download options (filename, quality, scale)
 */
export const downloadElementAsJPG = async (
  element: HTMLElement | null,
  options: DownloadOptions = {}
): Promise<boolean> => {
  if (!element) {
    console.error("Element not found for capture");
    return false;
  }

  const { 
    filename = "download.jpg", 
    quality = 0.95, 
    scale = 2 
  } = options;

  try {
    // Capture the element
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    // Convert to JPG blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });

    if (!blob) {
      throw new Error("Failed to create image blob");
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error downloading element as JPG:", error);
    return false;
  }
};

/**
 * Generate filename for Piagam download
 * @param pesantrenName - The name of the pesantren
 * @returns Formatted filename
 */
export const generatePiagamFilename = (pesantrenName: string): string => {
  // Sanitize pesantren name for filename
  const sanitized = pesantrenName
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50);
  
  return `Piagam_MPJ_${sanitized}.jpg`;
};

/**
 * Generate filename for E-ID download
 * @param name - The member name
 * @param type - Card type (virtual or physical)
 * @returns Formatted filename
 */
export const generateEIDFilename = (name: string, type: "virtual" | "physical"): string => {
  const sanitized = name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50);
  
  const suffix = type === "virtual" ? "Virtual" : "Fisik";
  return `EID_MPJ_${sanitized}_${suffix}.jpg`;
};
