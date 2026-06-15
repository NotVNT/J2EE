export const APP_RESULT_PREFIX = "moneymanager://payment/";
export const WEB_SUCCESS_PATH = "/payment/success";
export const WEB_CANCEL_PATH = "/payment/cancel";

const RESULT_STATUSES = new Set(["PAID", "CANCELLED", "CANCELED", "FAILED", "EXPIRED"]);

export function parsePaymentCheckoutUrl(rawUrl = "") {
  const safeUrl = String(rawUrl || "");
  const [baseUrl, queryAndHash = ""] = safeUrl.split("?");
  const [queryString = ""] = queryAndHash.split("#");
  const path = baseUrl.includes("://")
    ? `/${baseUrl.split("://")[1].split("/").slice(1).join("/")}`
    : baseUrl;

  const searchParams = new Map();
  queryString.split("&").filter(Boolean).forEach((item) => {
    const [key, value = ""] = item.split("=");
    searchParams.set(decodeURIComponent(key), decodeURIComponent(value));
  });

  return {
    pathname: path,
    getParam: (key) => searchParams.get(key) || ""
  };
}

export function hasPaymentResultParams(parsedUrl) {
  const status = parsedUrl.getParam("status").toUpperCase();
  const cancel = parsedUrl.getParam("cancel").toLowerCase();
  const hasPaymentIdentity = Boolean(parsedUrl.getParam("orderCode") || parsedUrl.getParam("id"));
  const hasResultSignal = RESULT_STATUSES.has(status) || cancel === "true" || cancel === "false";

  return hasPaymentIdentity && hasResultSignal;
}

export function derivePaymentResultFromUrl(parsedUrl, rawUrl) {
  if (rawUrl.includes(WEB_CANCEL_PATH) || parsedUrl.pathname.endsWith("/cancel")) {
    return "cancel";
  }
  if (rawUrl.includes(WEB_SUCCESS_PATH) || parsedUrl.pathname.endsWith("/success")) {
    return "success";
  }
  if (rawUrl.startsWith(APP_RESULT_PREFIX)) {
    return rawUrl.slice(APP_RESULT_PREFIX.length).split("?")[0] || "success";
  }
  if (parsedUrl.getParam("cancel").toLowerCase() === "true") {
    return "cancel";
  }
  if (["CANCELLED", "CANCELED", "FAILED", "EXPIRED"].includes(parsedUrl.getParam("status").toUpperCase())) {
    return "cancel";
  }
  return "success";
}

export function isPaymentResultUrl(url = "") {
  const safeUrl = String(url || "");
  const parsedUrl = parsePaymentCheckoutUrl(url);
  const isResultPath = parsedUrl.pathname.endsWith("/cancel") || parsedUrl.pathname.endsWith("/success");

  return safeUrl.startsWith(APP_RESULT_PREFIX)
    || safeUrl.includes(WEB_SUCCESS_PATH)
    || safeUrl.includes(WEB_CANCEL_PATH)
    || isResultPath
    || hasPaymentResultParams(parsedUrl);
}

export function isExternalPaymentScheme(url = "") {
  const lowerUrl = String(url || "").toLowerCase();
  return !lowerUrl.startsWith("http://")
    && !lowerUrl.startsWith("https://")
    && !lowerUrl.startsWith("about:blank");
}

export function buildPaymentResultParams(resultUrl = "", fallbackOrderCode = "") {
  const parsedUrl = parsePaymentCheckoutUrl(resultUrl);

  return {
    result: derivePaymentResultFromUrl(parsedUrl, resultUrl),
    orderCode: parsedUrl.getParam("orderCode") || fallbackOrderCode || "",
    status: parsedUrl.getParam("status") || "",
    id: parsedUrl.getParam("id") || ""
  };
}
