import { NextResponse, type NextRequest } from "next/server";

/**
 * Subdomínio por cliente: {slug}.sipatgo.com.br → login da campanha.
 * Apenas a raiz "/" e "/login" do subdomínio são reescritas; /app, /admin,
 * /api e demais rotas seguem normalmente.
 */
export function middleware(req: NextRequest) {
  const root = process.env.ROOT_DOMAIN;
  const host = (req.headers.get("host") ?? "").split(":")[0];
  if (!root || !host.endsWith(`.${root}`)) return NextResponse.next();
  const sub = host.slice(0, -root.length - 1);
  if (!sub || sub === "www") return NextResponse.next();
  const { pathname } = req.nextUrl;
  if (pathname === "/" || pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = `/${sub}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/", "/login"] };
