import QRCode from "qrcode";
import { checkinToken } from "./checkin";
import { appBaseUrl } from "./utils";

export function checkinUrl(eventId: string, secret: string) {
  return `${appBaseUrl()}/app/checkin?t=${encodeURIComponent(checkinToken(eventId, secret))}`;
}

export async function qrSvg(text: string, color = "#0f172a") {
  return QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: color, light: "#ffffff" } });
}

export async function qrPngDataUrl(text: string, size = 1024) {
  return QRCode.toDataURL(text, { margin: 1, width: size, errorCorrectionLevel: "M" });
}
