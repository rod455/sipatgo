/**
 * Relógio da aplicação. Em QA é possível congelar/simular a data com FAKE_NOW
 * (ISO 8601). Em produção só vale se ALLOW_FAKE_NOW=1.
 */
export function now(): Date {
  const fake = process.env.FAKE_NOW;
  if (fake && (process.env.NODE_ENV !== "production" || process.env.ALLOW_FAKE_NOW === "1")) {
    const d = new Date(fake);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}
