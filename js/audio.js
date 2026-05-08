import { t } from "./i18n.js";

const PREF_KEY = "magicTowerAudioPrefs";
const BGM_VOLUME = 0.2;
const SFX_VOLUME = 0.85;
const AudioContextClass = window.AudioContext || window.webkitAudioContext;

const BGM_TRACKS = Object.freeze({
  menu: { src: "assets/audio/bgm_menu.mp3", loop: true },
  explore: { src: "assets/audio/bgm_explore.mp3", loop: true },
  boss: { src: "assets/audio/bgm_boss.mp3", loop: true },
  shop: { src: "assets/audio/bgm_shop.mp3", loop: true },
  victory: { src: "assets/audio/bgm_victory.mp3", loop: false },
  defeat: { src: "assets/audio/bgm_defeat.mp3", loop: false }
});

let audioContext = null;
let masterGain = null;
let bgmAudio = null;
let bgmEnabled = false;
let currentBgmName = "explore";
let audioButton = null;

export function bindAudioButton(button) {
  audioButton = button;
  const prefs = loadPrefs();
  bgmEnabled = Boolean(prefs.bgmEnabled);
  updateAudioButton();

  audioButton?.addEventListener("click", () => {
    ensureAudio();
    bgmEnabled = !bgmEnabled;
    savePrefs();
    if (bgmEnabled) {
      playBgm(currentBgmName);
      playSound("pickup");
    } else {
      stopBgm();
      playSound("blocked");
    }
    updateAudioButton();
  });
  window.addEventListener("magicTowerLanguageChange", updateAudioButton);
}

export function primeAudio() {
  ensureAudio();
  if (bgmEnabled) {
    playBgm(currentBgmName);
  }
}

export function playBgm(name = currentBgmName) {
  const track = BGM_TRACKS[name] ?? BGM_TRACKS.explore;
  currentBgmName = BGM_TRACKS[name] ? name : "explore";

  if (!bgmEnabled) {
    return;
  }

  if (bgmAudio?.dataset.track === currentBgmName && !bgmAudio.paused) {
    return;
  }

  stopBgm();
  bgmAudio = new Audio(track.src);
  bgmAudio.dataset.track = currentBgmName;
  bgmAudio.loop = track.loop;
  bgmAudio.volume = BGM_VOLUME;
  bgmAudio.play().catch(() => {
    // Browsers may require a gesture. primeAudio retries on input.
  });
}

export function stopBgm() {
  if (!bgmAudio) {
    return;
  }

  bgmAudio.pause();
  bgmAudio.currentTime = 0;
  bgmAudio = null;
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
    skill: () => {
      [440, 660, 880].forEach((freq, index) => tone(freq, now + index * 0.05, 0.08, "sine", 0.05));
    },
    shield: () => {
      sweep(240, 520, now, 0.18, "triangle", 0.045);
      tone(392, now + 0.03, 0.16, "sine", 0.035);
    },
    victory: () => {
      [523, 659, 784, 1046].forEach((freq, index) => tone(freq, now + index * 0.08, 0.12, "triangle", 0.055));
    },
    defeat: () => {
      [220, 196, 165, 123].forEach((freq, index) => tone(freq, now + index * 0.12, 0.16, "sawtooth", 0.04));
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
    masterGain.gain.value = SFX_VOLUME;
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

function updateAudioButton() {
  if (!audioButton) {
    return;
  }

  audioButton.classList.toggle("active", bgmEnabled);
  audioButton.setAttribute("aria-label", bgmEnabled ? t("actions.audioOn") : t("actions.audioOff"));
  audioButton.title = bgmEnabled ? t("actions.audioOn") : t("actions.audioOff");
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
