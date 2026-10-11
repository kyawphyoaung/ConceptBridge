// app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // "next" parameter က login ပြီးရင် ဘယ် page ကို သွားမလဲ သတ်မှတ်တယ်
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Forwarded host ကို စစ်ဆေးပါ (Vercel deployment အတွက်)
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // Local development မှာ origin ကို တိုက်ရိုက် သုံးပါ
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // Production မှာ forwarded host ကို သုံးပါ
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error("Code exchange error:", error);
    }
  }

  // Error ဖြစ်ရင် /auth/error page ကို redirect လုပ်ပါ
  return NextResponse.redirect(`${origin}/auth/error`);
}