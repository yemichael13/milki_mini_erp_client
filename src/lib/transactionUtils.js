const FALLBACK_DATE_OPTIONS = { dateStyle: "medium", timeStyle: "short" };

export const formatMoney = (amount) => `$${Number(amount || 0).toLocaleString()}`;

export const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", FALLBACK_DATE_OPTIONS).format(date);
};

export const formatDepartment = (value) => {
  if (!value) return "N/A";
  return value
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

export const formatDisplayName = (name, email) => name || email || "Unknown user";

export const formatDisplayEmail = (email) => email || "N/A";

export const getReceiptUrls = (transaction, baseUrl = "") => {
  const receipt = transaction?.receipt_path || transaction?.receipt_image || transaction?.receipt_url;
  if (!receipt) return [];

  const toReceiptUrl = (value) => {
    if (!value) return null;
    if (typeof value !== "string") return null;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;

    const normalized = value.replace(/\\/g, "/");
    const cleanBase = (baseUrl || "").replace(/\/api\/?$/, "");

    const uploadIndex = normalized.indexOf("/uploads/");
    if (uploadIndex >= 0) return `${cleanBase}${normalized.slice(uploadIndex)}`;

    const relativeIndex = normalized.indexOf("uploads/");
    if (relativeIndex >= 0) return `${cleanBase}/${normalized.slice(relativeIndex)}`;

    if (normalized.startsWith("/")) return `${cleanBase}${normalized}`;
    return `${cleanBase}/uploads/${normalized}`;
  };

  if (Array.isArray(receipt)) {
    return receipt.map(toReceiptUrl).filter(Boolean);
  }

  if (typeof receipt === "string") {
    const trimmed = receipt.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(toReceiptUrl).filter(Boolean);
        }
      } catch {
        // fall through to the single-file handling below
      }
    }

    const singleUrl = toReceiptUrl(trimmed);
    return singleUrl ? [singleUrl] : [];
  }

  return [];
};

export const getReceiptKind = (receiptUrl) => {
  if (!receiptUrl) return "unknown";
  try {
    const pathname = new URL(receiptUrl).pathname.toLowerCase();
    if (pathname.endsWith(".pdf")) return "pdf";
    if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(pathname)) return "image";
  } catch {
    const lower = String(receiptUrl).toLowerCase();
    if (lower.endsWith(".pdf")) return "pdf";
    if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(lower)) return "image";
  }
  return "file";
};

export const getTransactionLabel = (value) => {
  if (!value) return "N/A";
  return value.replace(/_/g, " ");
};
