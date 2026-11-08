import { body, handle } from "@/lib/api";
import { findCompanyByCpf, throttle } from "@/lib/login";

/** Login do colaborador sem código da empresa: acha a campanha pelo CPF. */
export const POST = handle(async (req: Request) => {
  throttle(`find:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "?"}`);
  const b = await body<{ cpf: string }>(req);
  return findCompanyByCpf(b.cpf);
});
