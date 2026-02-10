const STORAGE_KEYS = {
  dailyAnswered: 'viva_daily_answered',
  entries: 'viva_entries',
  capsules: 'viva_capsules',
  firstUse: 'viva_first_use',
  subscribed: 'viva_subscribed'
};

const state = {
  pendingAudioBlob: null,
  pendingCapsuleMedia: { photos: [], videos: [] }
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const read = (k, fallback) => JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback));
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function init() {
  wireTabs();
  enforceSubscription();
  setupDailyQuestion();
  bindJournal();
  bindCapsule();
  bindBackup();
  renderEntries();
  renderMemoriesFeed();
  revealCapsulesDue();
}

function enforceSubscription() {
  const firstUse = read(STORAGE_KEYS.firstUse, null) || Date.now();
  write(STORAGE_KEYS.firstUse, firstUse);
  const subscribed = read(STORAGE_KEYS.subscribed, false);
  const trialDays = Math.floor((Date.now() - firstUse) / (1000 * 60 * 60 * 24));

  if (trialDays >= 3 && !subscribed) {
    document.getElementById('paywall').classList.remove('hidden');
  }
  document.getElementById('subscribe').onclick = () => {
    write(STORAGE_KEYS.subscribed, true);
    document.getElementById('paywall').classList.add('hidden');
  };
}

function setupDailyQuestion() {
  const answered = read(STORAGE_KEYS.dailyAnswered, null);
  const question = document.getElementById('question-screen');
  const app = document.getElementById('app-content');

  if (answered !== todayKey()) {
    question.classList.remove('hidden');
    app.classList.add('hidden');
  } else {
    question.classList.add('hidden');
    app.classList.remove('hidden');
  }

  const onAnswer = () => {
    write(STORAGE_KEYS.dailyAnswered, todayKey());
    question.classList.add('hidden');
    app.classList.remove('hidden');
    switchTab('journal');
  };

  document.getElementById('answer-yes').onclick = onAnswer;
  document.getElementById('answer-soft').onclick = onAnswer;
}

function bindJournal() {
  document.getElementById('journal-date').textContent = `Data de hoje: ${todayKey()}`;
  document.getElementById('photo-input').addEventListener('change', previewLocalMedia);
  document.getElementById('video-input').addEventListener('change', previewLocalMedia);
  document.getElementById('save-entry').onclick = saveEntry;
  bindAudioRecorder();
}

function bindAudioRecorder() {
  const btn = document.getElementById('record-audio');
  const status = document.getElementById('record-status');
  let recorder;
  let chunks = [];

  btn.onclick = async () => {
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = new MediaRecorder(stream);
      chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        state.pendingAudioBlob = new Blob(chunks, { type: 'audio/webm' });
        status.textContent = 'Áudio pronto para salvar no registro de hoje';
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      btn.textContent = 'Parar gravação';
      status.textContent = 'Gravando...';
      setTimeout(() => {
        if (recorder && recorder.state === 'recording') recorder.stop();
        btn.textContent = 'Gravar áudio curto';
      }, 30000);
    } catch {
      status.textContent = 'Permissão de áudio não concedida.';
    }
  };
}

async function saveEntry() {
  const now = new Date();
  const date = todayKey();
  const entries = read(STORAGE_KEYS.entries, []);
  const text = document.getElementById('journal-text').value.trim();
  const photos = await filesToDataUrls(document.getElementById('photo-input').files);
  const videos = await filesToDataUrls(document.getElementById('video-input').files);
  let audio = null;

  if (state.pendingAudioBlob) {
    audio = await blobToDataUrl(state.pendingAudioBlob);
  }

  if (!text && !photos.length && !videos.length && !audio) return;

  entries.push({
    id: crypto.randomUUID(),
    date,
    createdAt: now.toISOString(),
    text,
    photos,
    videos,
    audio
  });

  write(STORAGE_KEYS.entries, entries);

  document.getElementById('journal-text').value = '';
  document.getElementById('photo-input').value = '';
  document.getElementById('video-input').value = '';
  state.pendingAudioBlob = null;
  document.getElementById('record-status').textContent = 'até 30s';

  renderEntries();
  renderMemoriesFeed();
}

function renderEntries() {
  const date = todayKey();
  const list = document.getElementById('entry-list');
  const entries = read(STORAGE_KEYS.entries, []).filter((e) => e.date === date);

  list.innerHTML = '';
  if (!entries.length) {
    list.innerHTML = '<p class="muted">Nenhum registro salvo hoje.</p>';
    return;
  }

  entries.forEach((entry) => list.appendChild(buildEntryCard(entry, false)));
}

function renderMemoriesFeed() {
  const feed = document.getElementById('memories-feed');
  const entries = read(STORAGE_KEYS.entries, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  feed.innerHTML = '';

  if (!entries.length) {
    feed.innerHTML = '<div class="feed-item"><p>Suas memórias aparecerão aqui.</p><span class="feed-date">—</span><span class="feed-mascot">⭐</span></div>';
    return;
  }

  const base = entries.slice();
  const repeated = [...base, ...base, ...base];
  repeated.forEach((entry, i) => {
    const item = document.createElement('article');
    item.className = 'feed-item';
    item.appendChild(buildEntryContent(entry));
    const date = document.createElement('div');
    date.className = 'feed-date';
    date.textContent = formatDate(entry.date);
    const mascot = document.createElement('span');
    mascot.className = 'feed-mascot';
    mascot.textContent = ['🐦', '🌿', '⭐', '💗', '☀️'][i % 5];
    item.append(date, mascot);
    feed.appendChild(item);
  });

  feed.onscroll = () => {
    if (feed.scrollTop + feed.clientHeight > feed.scrollHeight - 200) {
      repeated.forEach((entry, i) => {
        const item = document.createElement('article');
        item.className = 'feed-item';
        item.appendChild(buildEntryContent(entry));
        const date = document.createElement('div');
        date.className = 'feed-date';
        date.textContent = formatDate(entry.date);
        const mascot = document.createElement('span');
        mascot.className = 'feed-mascot';
        mascot.textContent = ['🐦', '🌿', '⭐', '💗', '☀️'][i % 5];
        item.append(date, mascot);
        feed.appendChild(item);
      });
    }
  };
}

function bindCapsule() {
  document.getElementById('capsule-photo').addEventListener('change', async (e) => {
    state.pendingCapsuleMedia.photos = await filesToDataUrls(e.target.files);
  });
  document.getElementById('capsule-video').addEventListener('change', async (e) => {
    state.pendingCapsuleMedia.videos = await filesToDataUrls(e.target.files);
  });

  document.getElementById('save-capsule').onclick = async () => {
    const capsules = read(STORAGE_KEYS.capsules, []);
    const text = document.getElementById('capsule-text').value.trim();
    const dateInput = document.getElementById('capsule-date').value;
    let openDate = dateInput;

    if (!openDate) {
      const offset = Math.floor(Math.random() * 84) + 7;
      const d = new Date();
      d.setDate(d.getDate() + offset);
      openDate = d.toISOString().slice(0, 10);
    }

    if (!text && !state.pendingCapsuleMedia.photos.length && !state.pendingCapsuleMedia.videos.length) return;

    capsules.push({
      id: crypto.randomUUID(),
      text,
      openDate,
      photos: state.pendingCapsuleMedia.photos,
      videos: state.pendingCapsuleMedia.videos
    });

    write(STORAGE_KEYS.capsules, capsules);
    document.getElementById('capsule-text').value = '';
    document.getElementById('capsule-date').value = '';
    document.getElementById('capsule-photo').value = '';
    document.getElementById('capsule-video').value = '';
    state.pendingCapsuleMedia = { photos: [], videos: [] };

    renderCapsules();
    revealCapsulesDue();
  };

  document.getElementById('close-reveal').onclick = () => {
    document.getElementById('capsule-reveal').classList.add('hidden');
  };

  renderCapsules();
}

function renderCapsules() {
  const capsules = read(STORAGE_KEYS.capsules, []);
  const list = document.getElementById('capsule-list');
  list.innerHTML = capsules.length ? '' : '<p class="muted">Nenhuma cápsula criada.</p>';

  capsules.forEach((cap) => {
    const item = document.createElement('article');
    item.className = 'entry-item';
    const available = cap.openDate <= todayKey();
    item.innerHTML = `
      <p>${available ? cap.text || 'Cápsula sem texto' : '🔒 Cápsula aguardando abertura'}</p>
      <p class="muted">Abertura: ${formatDate(cap.openDate)}</p>
    `;
    if (available) item.appendChild(buildEntryContent(cap));
    list.appendChild(item);
  });
}

function revealCapsulesDue() {
  const capsules = read(STORAGE_KEYS.capsules, []);
  const due = capsules.find((c) => c.openDate <= todayKey());
  if (!due) return;
  document.getElementById('reveal-text').textContent = due.text || 'Uma lembrança do passado chegou para você.';
  document.getElementById('capsule-reveal').classList.remove('hidden');
}

function bindBackup() {
  const log = document.getElementById('status-log');

  document.getElementById('export-backup').onclick = () => {
    const payload = {
      entries: read(STORAGE_KEYS.entries, []),
      capsules: read(STORAGE_KEYS.capsules, []),
      dailyAnswered: read(STORAGE_KEYS.dailyAnswered, null),
      firstUse: read(STORAGE_KEYS.firstUse, null),
      subscribed: read(STORAGE_KEYS.subscribed, false)
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viva-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    log.textContent = 'Backup exportado com sucesso.';
  };

  document.getElementById('import-backup').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    write(STORAGE_KEYS.entries, data.entries || []);
    write(STORAGE_KEYS.capsules, data.capsules || []);
    write(STORAGE_KEYS.dailyAnswered, data.dailyAnswered || null);
    write(STORAGE_KEYS.firstUse, data.firstUse || Date.now());
    write(STORAGE_KEYS.subscribed, data.subscribed || false);
    log.textContent = 'Backup importado com sucesso.';
    renderEntries();
    renderCapsules();
    renderMemoriesFeed();
  });
}

function wireTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.onclick = () => switchTab(tab.dataset.tab);
  });
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('#app-content .screen').forEach((screen) => {
    screen.classList.toggle('hidden', screen.id !== name);
  });
}

function buildEntryCard(entry, compact = true) {
  const item = document.createElement('article');
  item.className = 'entry-item';
  item.appendChild(buildEntryContent(entry, compact));
  const date = document.createElement('p');
  date.className = 'muted';
  date.textContent = `${formatDate(entry.date)} • ${new Date(entry.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  item.appendChild(date);
  return item;
}

function buildEntryContent(entry, compact = false) {
  const box = document.createElement('div');
  if (entry.text) {
    const p = document.createElement('p');
    p.textContent = entry.text;
    box.appendChild(p);
  }
  (entry.photos || []).forEach((src) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Foto do registro';
    box.appendChild(img);
  });
  (entry.videos || []).forEach((src) => {
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    if (compact) video.preload = 'metadata';
    box.appendChild(video);
  });
  if (entry.audio) {
    const audio = document.createElement('audio');
    audio.src = entry.audio;
    audio.controls = true;
    box.appendChild(audio);
  }
  return box;
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function previewLocalMedia() {
  // Espaço para microinterações futuras ao anexar arquivos.
}

function filesToDataUrls(files) {
  return Promise.all([...files].map((file) => blobToDataUrl(file)));
}

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

init();
