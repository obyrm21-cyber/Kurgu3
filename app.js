const $ = s => document.querySelector(s);
const stage = $('#stage'), ctx = stage.getContext('2d');
let media = [], cues = [], selectedStyle = 'off', current = 0, playing = false, raf, installPrompt;
const audio = $('#audio');

// Web Audio API & Stream birleştirme (Ses kaydı eksikliğini çözer)
let audioCtx, audioSource, audioDestination;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioSource = audioCtx.createMediaElementSource(audio);
    audioDestination = audioCtx.createMediaStreamDestination();
    audioSource.connect(audioDestination);
    audioSource.connect(audioCtx.destination);
  }
}

function timecode(s) {
  const [h, m, rest] = s.replace(',', '.').split(':');
  const [sec, ms = '0'] = rest.split('.');
  return +h * 3600 + +m * 60 + +sec + +(ms + '00').slice(0, 3) / 1000;
}

function fmt(t) {
  t = Math.max(0, t);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
}

function parseSrt(text) {
  return text.trim().split(/\n\s*\n/).map(block => {
    const l = block.split(/\r?\n/);
    const i = l.findIndex(x => x.includes('-->'));
    if (i < 0) return null;
    return {
      start: timecode(l[i].split('-->')[0].trim()),
      end: timecode(l[i].split('-->')[1].trim()),
      text: l.slice(i + 1).join(' ').replace(/<[^>]+>/g, '').trim()
    };
  }).filter(Boolean);
}

function sortFiles(a, b) {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
}

function activeCue(t) {
  return cues.findIndex(c => t >= c.start && t < c.end);
}

function sceneAt(t) {
  const i = activeCue(t);
  return i < 0 ? Math.max(0, Math.min(media.length - 1, Math.floor(t / 5))) : i % Math.max(1, media.length);
}

function drawFrame(idx, t, alpha = 1) {
  const item = media[idx];
  if (!item) return;

  const p = cues[activeCue(t)];
  const progress = p ? Math.min(1, Math.max(0, (t - p.start) / (p.end - p.start))) : 0;
  let scale = 1, x = 0, y = 0;
  const motion = $('#motion').value;

  if (motion === 'zoomIn' || (motion === 'sequence' && idx % 2 === 0)) scale = 1 + progress * .08;
  else if (motion === 'zoomOut' || motion === 'sequence') scale = 1.08 - progress * .08;

  if (motion === 'panLeft') x = -progress * 35;
  if (motion === 'panRight') x = progress * 35;

  const obj = item.el;
  if (obj.tagName === 'VIDEO') {
    if (Math.abs(obj.currentTime - t - (p?.start || 0)) > .3) obj.currentTime = Math.max(0, t - (p?.start || 0));
  }

  const iw = obj.videoWidth || obj.naturalWidth || stage.width, ih = obj.videoHeight || obj.naturalHeight || stage.height;
  const fit = $('#fit').value, r = fit === 'contain' ? Math.min(stage.width / iw, stage.height / ih) : Math.max(stage.width / iw, stage.height / ih);
  const w = iw * r * scale, h = ih * r * scale;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(stage.width / 2 + x, stage.height / 2 + y);
  ctx.drawImage(obj, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function draw(t = 0) {
  // Seçilen çözünürlüğü canvas üzerine uygula
  const res = $('#resolution').value;
  if (res === '1440' && stage.width !== 2560) {
    stage.width = 2560; stage.height = 1440;
  } else if (res === '1080' && stage.width !== 1920) {
    stage.width = 1920; stage.height = 1080;
  }

  ctx.clearRect(0, 0, stage.width, stage.height);
  ctx.fillStyle = '#060914';
  ctx.fillRect(0, 0, stage.width, stage.height);

  if (!media.length) return;

  const idx = sceneAt(t);
  const p = cues[activeCue(t)];
  const transition = $('#transition').value;

  // Yumuşak Fade Geçiş Kontrolü
  if (transition === 'fade' && p && (t - p.start) < 0.5 && idx > 0) {
    const fadeProgress = (t - p.start) / 0.5;
    drawFrame(idx - 1, t, 1 - fadeProgress);
    drawFrame(idx, t, fadeProgress);
  } else {
    drawFrame(idx, t, 1);
  }

  // Renk Efektleri
  const effect = $('#effect').value;
  if (effect === 'warm') {
    ctx.fillStyle = 'rgba(255,150,40,.12)';
    ctx.fillRect(0, 0, stage.width, stage.height);
  }
  if (effect === 'cinema') {
    ctx.fillStyle = 'rgba(10,14,26,.18)';
    ctx.fillRect(0, 0, stage.width, stage.height);
  }
  if (effect === 'vignette') {
    const g = ctx.createRadialGradient(stage.width / 2, stage.height / 2, 120, stage.width / 2, stage.height / 2, stage.width / 2);
    g.addColorStop(0, 'transparent');
    g.addColorStop(1, 'rgba(0,0,0,.72)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, stage.width, stage.height);
  }

  if (p && selectedStyle !== 'off') drawSubtitle(p.text);

  $('#timeline').value = t;
  $('#timeLabel').textContent = `${fmt(t)} / ${fmt(audio.duration || cues.at(-1)?.end || 0)}`;
  document.querySelectorAll('.scene').forEach((e, i) => e.classList.toggle('active', i === idx));
}

function drawSubtitle(text) {
  const pos = $('#subPosition').value, size = $('#subSize').value;
  const scaleFactor = stage.width / 960;
  const baseFs = size === 'large' ? 34 : size === 'medium' ? 27 : 21;
  const fs = baseFs * scaleFactor;

  let y = stage.height - (55 * scaleFactor);
  if (pos === 'center') y = stage.height / 2;
  if (pos === 'top') y = 60 * scaleFactor;

  ctx.font = `800 ${fs}px Arial`;
  ctx.textAlign = 'center';

  const max = stage.width - (110 * scaleFactor), words = text.split(' ');
  let lines = [], line = '';

  for (const w of words) {
    if (ctx.measureText(line + ' ' + w).width > max) {
      lines.push(line);
      line = w;
    } else line += (line ? ' ' : '') + w;
  }
  if (line) lines.push(line);

  const lh = fs * 1.3;
  const style = selectedStyle;

  if (['box', 'neon', 'lower'].includes(style)) {
    ctx.fillStyle = style === 'neon' ? 'rgba(100,20,190,.78)' : 'rgba(0,0,0,.78)';
    ctx.fillRect(55 * scaleFactor, y - fs, stage.width - (110 * scaleFactor), lines.length * lh + fs * .5);
  }

  ctx.fillStyle = style === 'yellow' || style === 'karaoke' ? '#ffe35e' : '#fff';
  ctx.strokeStyle = 'rgba(0,0,0,.8)';
  ctx.lineWidth = 5 * scaleFactor;

  lines.forEach((l, i) => {
    const yy = y + i * lh;
    ctx.strokeText(l, stage.width / 2, yy);
    ctx.fillText(l, stage.width / 2, yy);
  });
}

function loadMedia(files) {
  media = [];
  [...files].sort(sortFiles).forEach(file => {
    const el = file.type.startsWith('video/') ? document.createElement('video') : new Image();
    el.src = URL.createObjectURL(file);
    el.muted = true;
    el.crossOrigin = 'anonymous';
    if (el.tagName === 'VIDEO') el.preload = 'auto';
    media.push({ name: file.name, el });
  });
  $('#emptyState').style.display = 'none';
  $('#status').textContent = `${media.length} medya hazır`;
  draw(current);
}

$('#mediaInput').onchange = e => loadMedia(e.target.files);
$('#audioInput').onchange = e => {
  const f = e.target.files[0];
  if (f) {
    audio.src = URL.createObjectURL(f);
    $('#audioLabel').textContent = f.name;
    initAudioContext();
  }
};
$('#srtInput').onchange = async e => {
  const f = e.target.files[0];
  if (f) {
    cues = parseSrt(await f.text());
    $('#srtLabel').textContent = f.name;
    $('#timeline').max = cues.at(-1)?.end || 1;
    renderScenes();
    $('#status').textContent = `${cues.length} altyazı bloğu hazır`;
    draw(current);
  }
};

function renderScenes() {
  const box = $('#scenes');
  box.innerHTML = '';
  $('#sceneCount').textContent = `${cues.length} sahne`;
  cues.forEach((c, i) => {
    const d = document.createElement('div');
    d.className = 'scene';
    d.innerHTML = `<strong>SAHNE ${String(i + 1).padStart(2, '0')}</strong><time>${fmt(c.start)} — ${fmt(c.end)}</time><p>${c.text}</p>`;
    d.onclick = () => {
      current = c.start;
      audio.currentTime = current;
      draw(current);
    };
    box.append(d);
  });
}

$('#playBtn').onclick = () => {
  initAudioContext();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  playing = !playing;
  $('#playBtn').textContent = playing ? 'Ⅱ' : '▶';
  if (playing) {
    audio.play().catch(() => {});
    tick();
  } else {
    audio.pause();
    cancelAnimationFrame(raf);
  }
};

audio.ontimeupdate = () => { current = audio.currentTime; draw(current); };
audio.onloadedmetadata = () => { $('#timeline').max = audio.duration; draw(current); };
$('#timeline').oninput = e => { current = +e.target.value; audio.currentTime = current; draw(current); };

function tick() {
  if (!playing) return;
  draw(audio.currentTime);
  raf = requestAnimationFrame(tick);
}

document.querySelectorAll('.style').forEach(b => b.onclick = () => {
  document.querySelectorAll('.style').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  selectedStyle = b.dataset.style;
  draw(current);
});
[...document.querySelectorAll('select')].forEach(s => s.onchange = () => draw(current));

// Güncellenmiş Render & Video Kayıt Mantığı (Ses Desteği İle)
$('#renderBtn').onclick = async () => {
  if (!media.length) { alert('Önce medya yükleyin.'); return; }
  initAudioContext();
  if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();

  const fps = $('#quality').value.includes('30') ? 30 : 24;
  const canvasStream = stage.captureStream(fps);

  // Ses ve Görüntü kanallarını birleştir
  const tracks = [...canvasStream.getVideoTracks()];
  if (audioDestination) {
    tracks.push(...audioDestination.stream.getAudioTracks());
  }

  const combinedStream = new MediaStream(tracks);
  const rec = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9' });
  const chunks = [];

  rec.ondataavailable = e => chunks.push(e.data);
  rec.onstop = () => {
    const url = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
    const a = $('#download');
    a.href = url;
    a.download = 'kurgu-canavari.webm';
    a.textContent = 'İndir: kurgu-canavari.webm';
    a.hidden = false;
    $('#status').textContent = 'WebM (Sesli) hazır';
  };

  rec.start();
  $('#renderBtn').disabled = true;
  $('#status').textContent = 'Kaydediliyor…';

  audio.currentTime = 0;
  audio.play();

  const end = audio.duration || cues.at(-1)?.end || Math.max(5, media.length * 5);
  let t = 0;

  const step = () => {
    draw(t);
    t += 1 / fps;
    if (t < end) setTimeout(step, 1000 / fps);
    else {
      audio.pause();
      rec.stop();
      $('#renderBtn').disabled = false;
    }
  };
  step();
};

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installPrompt = e;
  $('#installBtn').hidden = false;
});

$('#installBtn').onclick = async () => {
  if (installPrompt) {
    installPrompt.prompt();
    installPrompt = null;
  }
};

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
draw();
  
