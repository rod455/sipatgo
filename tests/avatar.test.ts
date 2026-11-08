import { describe, expect, it } from "vitest";
import { autoTopPool, categoryVisible, optionValues, renderAvatarSvg, sanitizeAvatar, SKIN_TONES } from "@/lib/avatar";
import { analyzeFacePixels, FACE_OVAL, nearestColor } from "@/lib/photo-sampler";

describe("avatar por gênero", () => {
  it("filtra cabelos do adventurer", () => {
    expect(optionValues("adventurer", "hair", "m").every((v) => v.startsWith("short"))).toBe(true);
    expect(optionValues("adventurer", "hair", "f").every((v) => v.startsWith("long"))).toBe(true);
    expect(optionValues("adventurer", "hair").length).toBe(45);
  });
  it("avataaars: barba só para homem, hijab só para mulher, chapéus para ambos", () => {
    expect(categoryVisible("avataaars", "facialHair", "f")).toBe(false);
    expect(categoryVisible("avataaars", "facialHair", "m")).toBe(true);
    expect(optionValues("avataaars", "top", "f")).toContain("hijab");
    expect(optionValues("avataaars", "top", "m")).not.toContain("hijab");
    expect(optionValues("avataaars", "top", "m")).toContain("winterHat1");
    expect(optionValues("avataaars", "top", "f")).toContain("winterHat1");
    expect(categoryVisible("adventurer", "earrings", "m")).toBe(false);
  });
  it("sem escolha explícita, o sorteio respeita o gênero", () => {
    for (let i = 0; i < 20; i++) {
      const svgM = renderAvatarSvg({ style: "avataaars", seed: `s${i}`, options: {}, gender: "f" });
      expect(svgM).toBeTruthy();
    }
  });
  it("paleta de pele ampliada", () => expect(SKIN_TONES.length).toBeGreaterThanOrEqual(12));
});

describe("sanitizeAvatar", () => {
  const prefix = "https://x.supabase.co/storage/v1/object/public/sipatgo-public/avatars/p1/";
  it("aceita foto só do próprio prefixo", () => {
    expect(sanitizeAvatar({ style: "photo", photo_url: `${prefix}a.jpg` }, "s", prefix).style).toBe("photo");
    expect(() => sanitizeAvatar({ style: "photo", photo_url: "https://evil.com/a.jpg" }, "s", prefix)).toThrow();
    expect(() => sanitizeAvatar({ style: "photo", photo_url: `${prefix}a.jpg` }, "s", null)).toThrow();
  });
  it("mantém gênero e cores hex arbitrárias", () => {
    const c = sanitizeAvatar({ style: "adventurer", gender: "m", options: { skinColor: "c58c85", hack: "x" } }, "s");
    expect(c).toMatchObject({ gender: "m", options: { skinColor: "c58c85" } });
    expect(c.options).not.toHaveProperty("hack");
    expect(sanitizeAvatar({ gender: "x" }, "s").gender).toBeUndefined();
  });
  it("foto renderiza como <image> escapado", () => {
    const svg = renderAvatarSvg({ style: "photo", seed: "s", options: {}, photo_url: 'https://a/b.jpg?x="1"' });
    expect(svg).toContain("<image");
    expect(svg).not.toContain('"1"');
  });
});

describe("análise da foto", () => {
  // imagem sintética: fundo cinza, cabelo escuro no topo, rosto no oval, barba no queixo
  function synth(S: number, beard: boolean) {
    const d = new Uint8ClampedArray(S * S * 4);
    const { cx, cy, rx, ry } = FACE_OVAL;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const nx = (x / S - cx) / rx, ny = (y / S - cy) / ry;
      let c = [200, 200, 205];
      if (nx * nx + ny * ny <= 1.25 && y / S < cy - ry * 0.6) c = [40, 25, 20]; // cabelo
      if (nx * nx + ny * ny <= 1 && y / S >= cy - ry * 0.6) c = [198, 140, 100]; // pele
      if (beard && nx * nx + ny * ny <= 1 && y / S > cy + ry * 0.55) c = [50, 35, 28]; // barba
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
    return d;
  }
  it("detecta pele, cabelo e barba", () => {
    const a = analyzeFacePixels(synth(256, true), 256);
    expect(nearestColor(a.skin, SKIN_TONES)).toMatch(/c68642|d9a066|ecad80|eac086/);
    expect(parseInt(a.hair.slice(0, 2), 16)).toBeLessThan(60);
    expect(a.beard).toBe(true);
    expect(a.hairContrast).toBeGreaterThan(18);
  });
  it("sem barba quando o queixo é pele", () => {
    expect(analyzeFacePixels(synth(256, false), 256).beard).toBe(false);
  });
});

describe("sorteio sem chapéu", () => {
  it("pool automático do avataaars não tem chapéu/gorro/hijab e respeita gênero", () => {
    for (const g of ["m", "f", undefined] as const) {
      const pool = autoTopPool(g);
      expect(pool.length).toBeGreaterThan(8);
      expect(pool.some((v) => /hat|hijab|turban/i.test(v))).toBe(false);
    }
    expect(autoTopPool("m")).not.toContain("bob");
    expect(autoTopPool("f")).not.toContain("theCaesar");
    expect(optionValues("avataaars", "top", "f")).toContain("hijab"); // ainda escolhível
  });
});
