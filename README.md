# Kurgu Canavarı PWA

Seslendirme, SRT ve 01, 02, 03 şeklinde adlandırılmış görsel/video dosyalarını tarayıcı içinde eşleştiren, GitHub Pages uyumlu yerel PWA şablonudur.

## Özellikler

- SRT zaman kodlarını ayrıştırır ve sahne zaman çizelgesini oluşturur.
- Görselleri ve videoları dosya adındaki numaraya göre sıralar.
- Seslendirme dosyasını yerel oynatıcıya bağlar.
- Ekranı doldur veya görseli koru seçenekleri sunar.
- Yaklaşma, uzaklaşma, yatay kaydırma ve hareketsiz görsel hareketlerini destekler.
- Keskin geçiş ve yumuşak fade seçenekleri sunar.
- Alt, merkez ve üst altyazı konumlarını destekler.
- Ekran görüntüsündeki stile göre 10 altyazı stili içerir.
- Canvas ön izlemesini tarayıcı destekliyorsa WebM olarak kaydeder.
- Service Worker ve manifest ile çevrimdışı kurulabilir PWA olarak çalışır.
- Medya dosyalarını sunucuya göndermez; işlem cihazdaki tarayıcıda yapılır.

## GitHub Pages ile yayınlama

1. Bu klasörün içeriğini bir GitHub deposunun kök dizinine yükleyin.
2. GitHub deposunda **Settings → Pages** bölümünü açın.
3. Kaynak olarak **Deploy from a branch**, dal olarak `main` ve klasör olarak `/ (root)` seçin.
4. Kaydedin ve verilen `https://kullaniciadi.github.io/depo-adi/` adresini açın.
5. Chrome veya Edge menüsünden uygulamayı ana ekrana yükleyebilirsiniz.

## Kullanım

Medya dosyalarını `01-sahne.jpg`, `02-sahne.mp4` gibi adlandırın. Seslendirme dosyasını ve aynı seslendirmeye ait SRT dosyasını yükleyin. Sahne planını seçin, canlı ön izlemeyi çalıştırın ve WebM çıktısını kaydedin.

## Sınırlar

Bu GitHub Pages sürümü sunucusuz ve ücretsiz bir başlangıç şablonudur. WebM kaydı Canvas ön izlemesini kaydeder. Tarayıcılar ses kanalını Canvas kaydına farklı uyguladığı için tam sesli MP4 dışa aktarma için FFmpeg tabanlı masaüstü veya sunucu katmanı eklenmelidir. MP4 seçeneği arayüzde şablon uyumluluğu için yer alır; gerçek tarayıcı çıktısı WebM'dir.

## Kaynak kapsamı

Arayüz, kullanıcının verdiği şablon görüntüsündeki sahne planı seçeneklerini ve Chrome Web Store'da açıklanan yerel ses–SRT–görsel eşleştirme akışını temel alır. YouTube bağlantısındaki ana fikir olan otomatik ses, görsel ve altyazı senkronizasyonu da bu akışa dahil edilmiştir.
