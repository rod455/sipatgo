/**
 * Extrai cores do rosto a partir de uma foto já recortada (quadrada) com o
 * rosto encaixado no oval-guia. Tudo roda no navegador: a foto não sai do
 * aparelho quando usada só para "criar pela foto".
 *
 * Geometria do oval-guia (em fração do lado S do quadrado) — o PhotoCropper
 * desenha exatamente este oval.
 */
export const FACE_OVAL = { cx: 0.5, cy: 0.5, rx: 0.26, ry: 0.34 };

export type RGB = [number, number, number];

export function toHex([r, g, b]: RGB): string {
  return [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

export function luminance([r, g, b]: RGB): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Mediana por canal (robusta a reflexos e sombras pontuais). */
export function medianColor(samples: RGB[]): RGB {
  if (!samples.length) return [128, 128, 128];
  const ch = (i: 0 | 1 | 2) => {
    const v = samples.map((s) => s[i]).sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)];
  };
  return [ch(0), ch(1), ch(2)];
}

/** Lê pixels de uma área quadrada (centro e lado em fração de S). */
export function readPatch(data: Uint8ClampedArray, S: number, fx: number, fy: number, fsize: number): RGB[] {
  const out: RGB[] = [];
  const half = Math.max(1, Math.round((fsize * S) / 2));
  const cx = Math.round(fx * S), cy = Math.round(fy * S);
  for (let y = cy - half; y <= cy + half; y += 2) {
    for (let x = cx - half; x <= cx + half; x += 2) {
      if (x < 0 || y < 0 || x >= S || y >= S) continue;
      const i = (y * S + x) * 4;
      if (data[i + 3] < 200) continue;
      const px: RGB = [data[i], data[i + 1], data[i + 2]];
      const l = luminance(px);
      if (l < 8 || l > 250) continue; // ignora preto/branco estourado
      out.push(px);
    }
  }
  return out;
}

/** Ajuste leve: fotos tendem a escurecer/esverdear a pele; puxa ~8% para tons quentes. */
function warmSkin([r, g, b]: RGB): RGB {
  return [Math.min(255, r * 1.06 + 4), Math.min(255, g * 1.02 + 2), b * 0.97];
}

export type FaceAnalysis = { skin: string; hair: string; beard: boolean; hairContrast: number };

export function analyzeFacePixels(data: Uint8ClampedArray, S: number): FaceAnalysis {
  const { cx, cy, rx, ry } = FACE_OVAL;
  const p = 0.06;
  const skin = medianColor([
    ...readPatch(data, S, cx - rx * 0.55, cy + ry * 0.12, p), // bochecha esquerda
    ...readPatch(data, S, cx + rx * 0.55, cy + ry * 0.12, p), // bochecha direita
    ...readPatch(data, S, cx, cy + ry * 0.02, p * 0.7),        // nariz
  ]);
  const hair = medianColor([
    ...readPatch(data, S, cx, cy - ry * 0.98, p),               // topo da cabeça
    ...readPatch(data, S, cx - rx * 0.62, cy - ry * 0.85, p),
    ...readPatch(data, S, cx + rx * 0.62, cy - ry * 0.85, p),
  ]);
  const chin = medianColor([
    ...readPatch(data, S, cx, cy + ry * 0.82, p),
    ...readPatch(data, S, cx - rx * 0.5, cy + ry * 0.7, p),
    ...readPatch(data, S, cx + rx * 0.5, cy + ry * 0.7, p),
  ]);
  const ls = luminance(skin);
  const beard = luminance(chin) < ls * 0.62;
  return { skin: toHex(warmSkin(skin)), hair: toHex(hair), beard, hairContrast: Math.abs(luminance(hair) - ls) };
}

/** Índice da cor mais próxima (distância perceptual simples). */
export function nearestColor(hex: string, palette: string[]): string {
  const rgb = (h: string): RGB => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  const [r1, g1, b1] = rgb(hex);
  let best = palette[0], bestD = Infinity;
  for (const p of palette) {
    const [r2, g2, b2] = rgb(p);
    const rm = (r1 + r2) / 2;
    const d = (2 + rm / 256) * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + (2 + (255 - rm) / 256) * (b1 - b2) ** 2;
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}
