# Viral Factory v0.2 — OpenAI API starter

## Bu sürümde
- Next.js web uygulaması
- Sunucu tarafında /api/generate endpoint'i
- OpenAI Responses API ile fikir üretimi
- Konsept, platform ve fikir sayısı kontrolleri
- API anahtarı tarayıcıya gönderilmez
- Mobil uyumlu temel arayüz

## Kurulum
1. Node.js 20+ kurulu bir bilgisayarda ZIP'i aç.
2. Proje klasöründe terminal aç ve npm install çalıştır.
3. .env.example dosyasını .env.local olarak kopyala.
4. .env.local içindeki OPENAI_API_KEY alanına kendi anahtarını yaz.
5. İstersen OPENAI_MODEL değerini hesabında erişimin olan bir modelle değiştir.
6. npm run dev çalıştır ve http://localhost:3000 adresini aç.

## Güvenlik
- API anahtarını sohbete, GitHub deposuna veya istemci tarafı dosyalara yapıştırma.
- .env.local Git tarafından yok sayılır.
- Canlıya alırken Vercel Project Settings > Environment Variables bölümüne OPENAI_API_KEY ekle.
- Kullanıcı kimlik doğrulaması ve istek limiti eklenmeden herkese açık yayınlama.

## Önemli
Bu sürüm yalnızca AI fikir ve görsel prompt üretir. Video üretmez, sosyal medyada paylaşım yapmaz, ödeme almaz ve otomatik e-posta göndermez. Bunlar sonraki modüllerdir.

OpenAI Responses API kullanılır.