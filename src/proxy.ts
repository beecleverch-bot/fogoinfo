import { NextResponse, type NextRequest } from "next/server";

// Anciennes URL du site Base44 (ex. /Politique, /Article?id=…) redirigées
// vers les nouvelles, pour garder les liens partagés et le référencement.
const ANCIENNES_URL: Record<string, string> = {
  "/Accueil": "/",
  "/Actualites": "/actualites",
  "/Politique": "/politique",
  "/Economie": "/economie",
  "/Societe": "/societe",
  "/Culture": "/culture",
  "/International": "/international",
  "/Tribunes": "/tribunes",
  "/Videos": "/videos",
  "/Recherche": "/recherche",
  "/Admin": "/admin",
  "/InviterAdmin": "/admin/inviter",
};

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const url = request.nextUrl.clone();

  if (pathname === "/Article") {
    const id = searchParams.get("id");
    url.pathname = id ? `/article/${encodeURIComponent(id)}` : "/";
    url.search = "";
    return NextResponse.redirect(url, 308);
  }

  const cible = ANCIENNES_URL[pathname];
  if (cible) {
    url.pathname = cible;
    if (cible === "/recherche") {
      const q = searchParams.get("q");
      url.search = q ? `?q=${encodeURIComponent(q)}` : "";
    } else {
      url.search = "";
    }
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|.*\\..*).*)"],
};
