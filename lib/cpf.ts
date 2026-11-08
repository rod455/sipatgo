export function normalizeCpf(input: string): string {
  return (input ?? "").replace(/\D/g, "");
}

/** Valida dígitos verificadores do CPF. */
export function isValidCpf(input: string): boolean {
  const cpf = normalizeCpf(input);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

/** ***.456.789-** */
export function maskCpf(input: string): string {
  const c = normalizeCpf(input).padStart(11, "0");
  return `***.${c.slice(3, 6)}.${c.slice(6, 9)}-**`;
}

export function formatCpf(input: string): string {
  const c = normalizeCpf(input);
  return c.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}
