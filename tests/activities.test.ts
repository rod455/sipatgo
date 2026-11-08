import { describe, expect, it } from "vitest";
import { checkAnswer, permutation, publicConfig, validateConfig } from "@/lib/activities";

const tf = { items: [0, 1, 2, 3, 4].map((i) => ({ statement: `A${i}`, answer: i % 2 === 0, explanation: `E${i}` })) };
const pairs = { pairs: [0, 1, 2, 3, 4].map((i) => ({ left: `L${i}`, right: `R${i}`, explanation: "" })) };
const fe = {
  image_url: "x.png", max_wrong_clicks: 5,
  hotspots: [0, 1, 2, 3, 4].map((i) => ({ id: `h${i}`, x: i * 20, y: 10, w: 10, h: 10, label: `H${i}`, explanation: "" })),
};

describe("dinâmicas", () => {
  it("valida 5 itens", () => {
    expect(validateConfig("true_false", tf).success).toBe(true);
    expect(validateConfig("true_false", { items: tf.items.slice(0, 4) }).success).toBe(false);
  });
  it("config pública não vaza respostas", () => {
    const pub = JSON.stringify(publicConfig("true_false", tf, "s"));
    expect(pub).not.toContain("answer");
    expect(pub).not.toContain("E0");
    const pubFe = JSON.stringify(publicConfig("find_errors", fe, "s"));
    expect(pubFe).not.toContain("hotspots");
  });
  it("fato ou fake", () => {
    expect(checkAnswer("true_false", tf, 0, { kind: "bool", value: true }, "s").status).toBe("correct");
    expect(checkAnswer("true_false", tf, 1, { kind: "bool", value: true }, "s").status).toBe("wrong");
  });
  it("ligue os pares com embaralhamento determinístico", () => {
    const seed = "participante:atividade";
    const pub = publicConfig("match_pairs", pairs, seed) as { right: string[] };
    const pos = pub.right.indexOf("R3");
    expect(checkAnswer("match_pairs", pairs, 3, { kind: "pair", left: 3, right: pos }, seed).status).toBe("correct");
    expect(checkAnswer("match_pairs", pairs, 2, { kind: "pair", left: 2, right: pos }, seed).status).toBe("wrong");
    expect(permutation(5, seed)).toEqual(permutation(5, seed));
    expect(permutation(5, seed)).not.toEqual([0, 1, 2, 3, 4]);
  });
  it("encontre os erros: acerto, erro e repetido", () => {
    const hit = checkAnswer("find_errors", fe, 0, { kind: "click", x: 45, y: 15 }, "s");
    expect(hit).toMatchObject({ status: "correct", itemIndex: 2 });
    expect(checkAnswer("find_errors", fe, 0, { kind: "click", x: 50, y: 80 }, "s").status).toBe("wrong");
    expect(checkAnswer("find_errors", fe, 0, { kind: "click", x: 45, y: 15 }, "s", new Set([2])).status).toBe("ignored");
  });
  it("acerte em tempo: null = tempo esgotado = erro", () => {
    const q = { time_limit_s: 15, items: [0, 1, 2, 3, 4].map(() => ({ question: "q", options: ["a", "b", "c", "d"], correct_index: 2, explanation: "" })) };
    expect(checkAnswer("timed_quiz", q, 0, { kind: "choice", index: null }, "s").status).toBe("wrong");
    expect(checkAnswer("timed_quiz", q, 0, { kind: "choice", index: 2 }, "s").status).toBe("correct");
  });
});
