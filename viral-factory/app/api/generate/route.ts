import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
 try {
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OPENAI_API_KEY sunucu ortamında tanımlı değil. .env.local dosyasını ayarla." }, { status: 503 });
  const body = await request.json(); const concept = typeof body.concept === "string" ? body.concept.trim().slice(0,300) : ""; const platform = typeof body.platform === "string" ? body.platform.slice(0,100) : "YouTube Shorts"; const count = Math.min(10,Math.max(1,Number(body.count)||5));
  if (!concept) return NextResponse.json({error:"Bir içerik konsepti yaz."},{status:400});
  const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY}); const model = process.env.OPENAI_MODEL || "gpt-6-luna";
  const response = await client.responses.create({model,instructions:["Sen Viral Factory adlı profesyonel kısa video içerik stratejistisin.","Türkçe yanıt ver. Özgün, tekrarsız ve üretilebilir fikirler oluştur.","Gerçek bilgi içeren konularda uydurma iddia üretme; doğrulama gerektirenleri belirt.","Her fikirde güçlü ilk 1-2 saniye kancası ve görsel üretim promptu bulunmalı.","Görsel promptta dikey 9:16, tek ve anlaşılır ana olay, kamera hareketi, ışık ve fiziksel tutarlılık belirt.","İstenen sayıda fikir üret. Fikirleri birbirinden belirgin biçimde farklı yap.","Yalnızca geçerli JSON döndür; markdown kod bloğu veya açıklama ekleme."].join(" "),input:`Konsept: ${concept}\nPlatform: ${platform}\nFikir sayısı: ${count}\nJSON biçimi: {"ideas":[{"title":"...","hook":"...","concept":"...","visual_prompt":"...","duration_seconds":9,"platform":"..."}]}`});
  const parsed = JSON.parse(response.output_text); if (!Array.isArray(parsed.ideas)) throw new Error("Model beklenen JSON yapısını döndürmedi.");
  const ideas = parsed.ideas.slice(0,count).map((x:any)=>({title:String(x.title||"Başlıksız fikir"),hook:String(x.hook||""),concept:String(x.concept||""),visual_prompt:String(x.visual_prompt||""),duration_seconds:Number(x.duration_seconds)||9,platform}));
  return NextResponse.json({ideas,model});
 } catch(error) { console.error("Viral Factory generation error:",error); return NextResponse.json({error:"Fikir üretilemedi. API anahtarı, API bakiyesi ve model erişimini kontrol et."},{status:500}); }
}