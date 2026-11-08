import { body, handle } from "@/lib/api";
import { companyBySlug, lookup } from "@/lib/login";

export const POST = handle(async (req: Request) => {
  const b = await body<{ slug: string; cpf: string }>(req);
  const company = await companyBySlug(b.slug);
  return lookup(company, b.cpf);
});
