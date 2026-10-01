import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  if(request.nextUrl.pathname==='/proof-preview') return NextResponse.next();
  if (process.env.PROOFADMIN_ENABLED === "true") {
    if(/^\/admin(\/|$)/.test(request.nextUrl.pathname)) return NextResponse.redirect('https://login.proofcreatives.com/admin');
    const url=process.env.PROOFADMIN_SUPABASE_URL,key=process.env.PROOFADMIN_PUBLISHABLE_KEY,site=process.env.PROOFADMIN_SITE_ID;
    if(url==='https://lqhgemgmduxhvmfurtob.supabase.co'&&key&&site==='10000000-0000-4000-8000-000000000003'&&request.method==='GET'){
      const query=new URLSearchParams({select:'target,status',site_id:`eq.${site}`,path:`eq.${request.nextUrl.pathname}`});
      const response=await fetch(`${url}/rest/v1/clean_links?${query}`,{headers:{apikey:key},cache:'no-store'});
      if(response.ok){const link=(await response.json())[0];if(link&&/^https:\/\//.test(link.target)&&[301,302,307,308].includes(link.status))return NextResponse.redirect(new URL(link.target),link.status);}
    }
    return NextResponse.next();
  }
  if(process.env.VERCEL_ENV==='preview'&&/^\/admin(\/|$)/.test(request.nextUrl.pathname))return NextResponse.redirect('https://login.proofcreatives.com/admin');
  if(!/^\/admin(\/|$)/.test(request.nextUrl.pathname))return NextResponse.next();
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
