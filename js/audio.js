const PREF_KEY = "magicTowerAudioPrefs";
const AudioContextClass = window.AudioContext || window.webkitAudioContext;

let audioContext = null;
let masterGain = null;
let bgmTimer = 0;
let bgmStep = 0;
let bgmEnabled = false;
let audioButton = null;

const bgmNotes = [196, 247, 294, 247, 220, 262, 330, 262, 196, 247, 294, 370, 330, 294, 247, 220];

export function bindAudioButton(button) {
  audioButton = button;
  const prefs = loadPrefs();
  bgmEnabled = Boolean(prefs.bgmEnabled);
  updateAudioButton();

  audioButton.addEventListener("click", () => {
    ensureAudio();
    bgmEnabled = !bgmEnabled;
    savePrefs();
    if (bgmEnabled) {
      startBgm();
      playSound("pickup");
    } else {
      stopBgm();
      playSound("blocked");
    }
    updateAudioButton();
  });
}

export function primeAudio() {
  ensureAudio();
  if (bgmEnabled) {
    startBgm();
  }
}

export function playSound(name) {
  const context = ensureAudio();
  if (!context) {
    return;
  }

  const now = context.currentTime;
  const sounds = {
    move: () => sweep(160, 230, now, 0.06, "triangle", 0.035),
    blocked: () => {
      sweep(120, 70, now, 0.09, "square", 0.05);
      noise(now, 0.05, 0.035, 360);
    },
    attack: () => {
      sweep(620, 180, now, 0.14, "sawtooth", 0.07);
      tone(920, now + 0.03, 0.05, "triangle", 0.045);
    },
    hit: () => {
      noise(now, 0.12, 0.07, 820);
      sweep(180, 90, now, 0.12, "square", 0.04);
    },
    pickup: () => {
      tone(740, now, 0.07, "sine", 0.06);
      tone(1040, now + 0.07, 0.08, "sine", 0.05);
    },
    door: () => {
      tone(180, now, 0.07, "square", 0.055);
      tone(240, now + 0.08, 0.08, "square", 0.045);
    },
    stairs: () => {
      [262, 330, 392].forEach((freq, index) => tone(freq, now + index * 0.06, 0.08, "triangle", 0.045));
    },
    shop: () => {
      tone(523, now, 0.08, "triangle", 0.045);
      tone(659, now + 0.08, 0.08, "triangle", 0.04);
    },
    levelUp: () => {
      [392, 494, 587, 784].forEach((freq, index) => tone(freq, now + index * 0.07, 0.1, "sine", 0.055));
    }
  };

  sounds[name]?.();
}

export function playCombatSounds(isMagic = false, leveledUp = false) {
  playSound(isMagic ? "shop" : "attack");
  window.setTimeout(() => playSound("hit"), 95);
  if (leveledUp) {
    window.setTimeout(() => playSound("levelUp"), 220);
  }
}

function ensureAudio() {
  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.22;
    masterGain.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function tone(freq, start, duration, type = "sine", gainValue = 0.05) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function sweep(startFreq, endFreq, start, duration, type, gainValue) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFreq, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function noise(start, duration, gainValue, filterFreq) {
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, Math.ceil(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  filter.type = "lowpass";
  filter.frequency.value = filterFreq;
  gain.gain.setValueAtTime(gainValue, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(masterGain);
  source.start(start);
}

function startBgm() {
  if (!ensureAudio() || bgmTimer) {
    return;
  }

  const playStep = () => {
    if (!bgmEnabled || !audioContext) {
      bgmTimer = 0;
      return;
    }

    const now = audioContext.currentTime;
    const freq = bgmNotes[bgmStep % bgmNotes.length];
    tone(freq, now, 0.14, "triangle", 0.018);
    if (bgmStep % 4 === 0) {
      tone(freq / 2, now, 0.22, "sine", 0.015);
    }
    bgmStep += 1;
    bgmTimer = window.setTimeout(playStep, 190);
  };

  playStep();
}

function stopBgm() {
  window.clearTimeout(bgmTimer);
  bgmTimer = 0;
}

function updateAudioButton() {
  if (!audioButton) {
    return;
  }

  audioButton.classList.toggle("active", bgmEnabled);
  audioButton.setAttribute("aria-label", bgmEnabled ? "关闭背景音乐" : "开启背景音乐");
  audioButton.title = bgmEnabled ? "关闭背景音乐" : "开启背景音乐";
}

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY)) ?? {};
  } catch {
    return {};
  }
}

function savePrefs() {
  localStorage.setItem(PREF_KEY, JSON.stringify({ bgmEnabled }));
}
