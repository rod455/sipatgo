import { z } from "zod";

export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
  "Ainda não sei",
] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Schema do lead, compartilhado entre o formulário (cliente) e /api/leads (servidor). */
export const leadSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome.").max(120),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido.").max(160),
  empresa: z.string().trim().min(2, "Informe o nome da empresa.").max(160),
  cargo: optionalText(120),
  pessoas: z.coerce
    .number({ invalid_type_error: "Informe o número de pessoas." })
    .int("Use um número inteiro.")
    .min(1, "Informe o número de pessoas.")
    .max(1_000_000, "Número muito alto."),
  mes: optionalText(40),
  mensagem: optionalText(2000),
  origem: z.string().trim().max(80).default("site"),
});

export type Lead = z.infer<typeof leadSchema>;
export type LeadFieldErrors = Partial<Record<keyof Lead, string>>;

/** Nome do campo-armadilha (honeypot). Humanos não veem; bots preenchem. */
export const HONEYPOT_FIELD = "website";
