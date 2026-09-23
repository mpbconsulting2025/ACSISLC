(() => {
  "use strict";

  const STORAGE_KEY = "acsis-clarity-v6";
  const LEGACY_STORAGE_KEYS = ["acsis-clarity-v5"];
  const ROUTES = ["home", "focus", "breathe", "meditate", "soundscapes"];
  const PAGE_TITLES = {
    home: "Choose what you need",
    focus: "Focus on one useful step",
    breathe: "Find a comfortable rhythm",
    meditate: "Make room for quiet",
    soundscapes: "Shape your listening space"
  };

  const DEFAULT_STATE = {
    lastTool: null,
    settings: {
      volume: 35,
      reduceMotion: false,
      lowStimulation: false
    },
    focus: {
      mode: "focus",
      focusDuration: 25,
      breakDuration: 5,
      blocks: 1,
      useBreathing: false,
      breathingLength: 3,
      alerts: {
        focusStart: true,
        breakStart: true,
        sessionEnd: true
      },
      tasks: [
        { id: "task-1", text: "", done: false },
        { id: "task-2", text: "", done: false }
      ],
      impact: "",
      reflection: "",
      completedFocusBlocks: 0,
      sound: "none",
      frequency: 0,
      ambientVolume: 30,
      frequencyVolume: 14,
      distractions: []
    },
    breathe: {
      pattern: "box",
      duration: 3,
      chimes: false,
      sound: "none",
      frequency: 0,
      ambientVolume: 30,
      frequencyVolume: 14,
      resonanceRate: 6,
      resonanceRatio: "equal"
    },
    meditation: {
      duration: 10,
      anchor: "breath",
      sound: "none",
      frequency: 0,
      ambientVolume: 30,
      frequencyVolume: 14,
      guidancePings: true
    },
    sound: {
      channels: {
        rain: 0,
        ocean: 0,
        forest: 0,
        fire: 0,
        pink: 0,
        brown: 0
      },
      preset: null,
      frequency: 0,
      frequencyVolume: 8
    }
  };

  const BREATH_PATTERNS = {
    box: [
      { label: "Breathe in", short: "Then hold", seconds: 4, type: "in" },
      { label: "Hold gently", short: "Then breathe out", seconds: 4, type: "hold-in" },
      { label: "Breathe out", short: "Then hold", seconds: 4, type: "out" },
      { label: "Hold gently", short: "Then breathe in", seconds: 4, type: "hold-out" }
    ],
    ease: [
      { label: "Breathe in", short: "Then breathe out", seconds: 4, type: "in" },
      { label: "Breathe out", short: "Let the exhale be easy", seconds: 6, type: "out" }
    ],
    steady: [
      { label: "Breathe in", short: "Then breathe out", seconds: 5, type: "in" },
      { label: "Breathe out", short: "Then breathe in", seconds: 5, type: "out" }
    ],
    "478": [
      { label: "Breathe in", short: "Then hold", seconds: 4, type: "in" },
      { label: "Hold gently", short: "Then breathe out", seconds: 7, type: "hold-in" },
      { label: "Breathe out", short: "Let the breath empty slowly", seconds: 8, type: "out" }
    ]
  };

  const SOUND_PRESETS = {
    focus: {
      title: "Clear focus",
      description: "A steady layer of pink noise with light rainfall.",
      channels: { rain: 24, ocean: 0, forest: 0, fire: 0, pink: 42, brown: 0 }
    },
    settle: {
      title: "Settle",
      description: "Slow ocean movement supported by a low, soft noise layer.",
      channels: { rain: 0, ocean: 50, forest: 0, fire: 0, pink: 0, brown: 24 }
    },
    restore: {
      title: "Restore",
      description: "Woodland air and a distant, unhurried ocean.",
      channels: { rain: 0, ocean: 27, forest: 46, fire: 0, pink: 0, brown: 0 }
    },
    shelter: {
      title: "Sound shelter",
      description: "A fuller blend of rainfall and brown noise for a more enclosed feel.",
      channels: { rain: 45, ocean: 0, forest: 0, fire: 0, pink: 0, brown: 40 }
    },
    rain: {
      title: "Soft rain",
      description: "A light, even rainfall layer.",
      channels: { rain: 50, ocean: 0, forest: 0, fire: 0, pink: 0, brown: 0 }
    },
    ocean: {
      title: "Slow ocean",
      description: "Low waves rising and falling at an unhurried pace.",
      channels: { rain: 0, ocean: 55, forest: 0, fire: 0, pink: 0, brown: 0 }
    },
    forest: {
      title: "Woodland air",
      description: "Soft moving air with occasional distant bird-like tones.",
      channels: { rain: 0, ocean: 0, forest: 52, fire: 0, pink: 0, brown: 0 }
    },
    fire: {
      title: "Fireside",
      description: "Low warmth with gentle, irregular crackle.",
      channels: { rain: 0, ocean: 0, forest: 0, fire: 50, pink: 0, brown: 0 }
    },
    pink: {
      title: "Pink noise",
      description: "A balanced noise layer with softened high frequencies.",
      channels: { rain: 0, ocean: 0, forest: 0, fire: 0, pink: 48, brown: 0 }
    },
    brown: {
      title: "Brown noise",
      description: "A deeper noise layer with more low-frequency energy.",
      channels: { rain: 0, ocean: 0, forest: 0, fire: 0, pink: 0, brown: 48 }
    }
  };

  const MEDITATION_PROMPTS = {
    breath: [
      "Let the next moment be enough.",
      "Notice where you feel the natural breath most clearly.",
      "Follow one full inhale and one full exhale.",
      "When attention wanders, gently return.",
      "Let the breath continue without trying to improve it."
    ],
    body: [
      "Notice where the chair, floor or bed is carrying some of your weight.",
      "Bring attention to your feet and lower legs. Notice pressure, temperature or nothing in particular.",
      "Move slowly through your hips, abdomen and chest. There is no need to relax them.",
      "Notice your hands, arms, shoulders and jaw, one area at a time.",
      "Take in the whole body and the surfaces supporting it."
    ],
    brushing: [
      "Choose whether touch feels supportive today. You can skip it.",
      "If comfortable, brush one hand slowly along the opposite forearm.",
      "Repeat on the other arm, over clothing if you prefer.",
      "Try a gentle brush from each shoulder down towards the hands.",
      "Rest your hands and notice any change, without judging it."
    ],
    sound: [
      "Let sounds arrive without following them.",
      "Notice what is near and what is distant.",
      "There is no need to name each sound.",
      "Notice the spaces between sounds.",
      "Return to listening."
    ],
    open: [
      "Notice what is here, without needing to change it.",
      "Let thoughts pass through the wider space of attention.",
      "Begin again from this moment.",
      "Notice sensations, sounds and thoughts together.",
      "Allow experience to move at its own pace."
    ]
  };

  const MEDITATION_HELP = {
    breath: {
      title: "Using breath guidance",
      copy: "Notice where an ordinary breath is easiest to feel, perhaps at the nostrils, chest or abdomen. You are observing the breath, not making it deeper."
    },
    body: {
      title: "Using a body scan",
      copy: "Support means the physical contact carrying some of your weight, such as feet on the floor, legs on a chair or your back on a bed. Notice pressure, warmth, movement or no clear sensation. Nothing special needs to happen."
    },
    brushing: {
      title: "Using body brushing",
      copy: "If touch feels comfortable, slowly brush a hand along the opposite arm, over clothing if preferred. Use light, predictable pressure. Skip any area or choose another practice if touch does not feel supportive."
    },
    sound: {
      title: "Using listening guidance",
      copy: "Let sound be the place you return to. Notice one sound, then the wider mixture of near and distant sounds. You do not need to identify or interpret them."
    },
    open: {
      title: "Using open awareness",
      copy: "Notice whatever is most apparent, such as a thought, sound or body sensation, without choosing one fixed anchor. If this feels too broad, return to breath or listening guidance."
    }
  };

  const BREATH_HELP = {
    box: {
      title: "Box breathing",
      copy: "A clear four-part pattern can give a busy mind one predictable sequence to follow. The holds may not suit everyone, so shorten or stop them if they feel uncomfortable."
    },
    ease: {
      title: "Longer exhale",
      copy: "A gentle exhale that is slightly longer than the inhale can support settling. Keep the breath light and shorten the count if six seconds feels strained."
    },
    steady: {
      title: "Steady breathing",
      copy: "An even five-in, five-out rhythm is simple to remember and sits close to six breaths per minute, a pace commonly used in slow-breathing practice."
    },
    "478": {
      title: "4-7-8 breathing",
      copy: "This longer pattern can provide a strong point of focus. The seven-second hold is optional. Choose another rhythm if holding your breath feels effortful or unpleasant."
    },
    resonance: {
      title: "Resonance breathing",
      copy: "Slow breathing around 4.5 to 6.5 breaths per minute is often used in HRV biofeedback. The most suitable pace is personal, and finding an exact resonance rate normally needs reliable HRV measurement."
    }
  };

  const FREQUENCY_META = {
    174: { name: "Grounding tone", help: "Commonly marketed online as a grounding or pain-relief frequency. Those effects are not established. It is simply a very low pure tone that some listeners may find less intrusive." },
    285: { name: "Restoration tone", help: "Commonly marketed as a restoration or healing frequency. There is no good evidence that 285 Hz repairs the body. Treat it as a low listening texture." },
    396: { name: "Release tone", help: "Commonly marketed as a tone for releasing fear or guilt. That emotional effect is not proven. The label is included so you can recognise how it is described online." },
    417: { name: "Change tone", help: "Commonly marketed as a tone for change or fresh starts. This is a traditional marketing label, not a reliable outcome of listening." },
    432: { name: "Focus or alternative-tuning tone", help: "Often marketed as a focus or calming frequency, and used as an alternative tuning reference. Research does not establish unique healing effects, so treat 432 Hz as a listening preference." },
    528: { name: "Love or miracle tone", help: "Often marketed as the love, happiness or miracle frequency. Claims about transformation or DNA repair are not supported. Use it only as a brighter pure tone if you enjoy it." },
    639: { name: "Connection tone", help: "Commonly marketed as a relationship or connection frequency. There is no evidence that the tone itself improves relationships. The name reflects common online descriptions." },
    741: { name: "Expression tone", help: "Commonly marketed for expression, clarity or problem-solving. Those effects are not established. It is a high tone that may feel prominent." },
    852: { name: "Intuition tone", help: "Commonly marketed as an intuition or spiritual-order frequency. Those claims are not scientifically established. Use a low volume and stop if it feels sharp." }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function mergeState(saved) {
    const merged = {
      ...DEFAULT_STATE,
      ...saved,
      settings: { ...DEFAULT_STATE.settings, ...(saved?.settings || {}) },
      focus: {
        ...DEFAULT_STATE.focus,
        ...(saved?.focus || {}),
        alerts: { ...DEFAULT_STATE.focus.alerts, ...(saved?.focus?.alerts || {}) }
      },
      breathe: { ...DEFAULT_STATE.breathe, ...(saved?.breathe || {}) },
      meditation: { ...DEFAULT_STATE.meditation, ...(saved?.meditation || {}) },
      sound: {
        ...DEFAULT_STATE.sound,
        ...(saved?.sound || {}),
        channels: { ...DEFAULT_STATE.sound.channels, ...(saved?.sound?.channels || {}) }
      }
    };
    const oldFocus = saved?.focus || {};
    if (!Array.isArray(oldFocus.tasks)) {
      const recovered = [oldFocus.task, oldFocus.firstStep].filter((item) => typeof item === "string" && item.trim());
      merged.focus.tasks = recovered.map((text, index) => ({ id: `task-${index + 1}`, text, done: false }));
    }
    if (!merged.focus.tasks.length) merged.focus.tasks = [{ id: "task-1", text: "", done: false }];
    while (merged.focus.tasks.length < 2) {
      merged.focus.tasks.push({ id: `task-${Date.now()}-${merged.focus.tasks.length}`, text: "", done: false });
    }
    merged.focus.tasks = merged.focus.tasks.map((task, index) => ({
      id: String(task.id || `task-${index + 1}`),
      text: String(task.text || ""),
      done: Boolean(task.done)
    }));
    merged.focus.focusDuration = Number(oldFocus.focusDuration || oldFocus.duration || merged.focus.focusDuration);
    merged.focus.breakDuration = Number(oldFocus.breakDuration || merged.focus.breakDuration);
    return merged;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
      const saved = raw ? JSON.parse(raw) : null;
      return mergeState(saved);
    } catch {
      return mergeState(null);
    }
  }

  let state = loadState();
  let saveTimer = 0;
  let statusTimer = 0;

  function saveState(immediate = false) {
    const write = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      saveTimer = 0;
    };
    window.clearTimeout(saveTimer);
    if (immediate) write();
    else saveTimer = window.setTimeout(write, 180);
  }

  function announce(message, duration = 2600) {
    const region = $("[data-status]");
    window.clearTimeout(statusTimer);
    region.textContent = message;
    statusTimer = window.setTimeout(() => {
      region.textContent = "";
    }, duration);
  }

  function formatTime(totalSeconds) {
    const safe = Math.max(0, Math.ceil(totalSeconds));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  class DeadlineTimer {
    constructor({ onTick, onComplete }) {
      this.onTick = onTick;
      this.onComplete = onComplete;
      this.duration = 0;
      this.remaining = 0;
      this.endAt = 0;
      this.running = false;
      this.interval = 0;
    }

    set(seconds) {
      this.stopInterval();
      this.duration = seconds;
      this.remaining = seconds;
      this.running = false;
      this.emit();
    }

    start() {
      if (this.running || this.remaining <= 0) return;
      this.endAt = Date.now() + this.remaining * 1000;
      this.running = true;
      this.tick();
      this.interval = window.setInterval(() => this.tick(), 250);
    }

    pause() {
      if (!this.running) return;
      this.tick(false);
      this.running = false;
      this.stopInterval();
      this.emit();
    }

    reset(seconds = this.duration) {
      this.set(seconds);
    }

    tick(complete = true) {
      if (!this.running) return;
      this.remaining = Math.max(0, (this.endAt - Date.now()) / 1000);
      this.emit();
      if (complete && this.remaining <= 0) {
        this.running = false;
        this.stopInterval();
        this.onComplete?.();
      }
    }

    emit() {
      const progress = this.duration > 0 ? Math.min(1, Math.max(0, (this.duration - this.remaining) / this.duration)) : 0;
      this.onTick?.(this.remaining, this.duration, progress);
    }

    stopInterval() {
      window.clearInterval(this.interval);
      this.interval = 0;
    }
  }

  class ClarityAudio {
    constructor() {
      this.context = null;
      this.master = null;
      this.channelNodes = {};
      this.tone = null;
      this.toneGain = null;
      this.playing = false;
      this.forestTimer = 0;
      this.ambientScale = 1;
      this.currentChannels = { ...state.sound.channels };
      this.currentFrequency = state.sound.frequency;
      this.currentFrequencyVolume = state.sound.frequencyVolume;
      this.currentLabel = "No sound selected";
    }

    async ensure() {
      if (!this.context) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) throw new Error("Audio is not supported in this browser.");
        this.context = new AudioContextClass();
        this.master = this.context.createGain();
        this.master.gain.value = this.volumeValue();
        this.master.connect(this.context.destination);
        this.createChannels();
        this.createTone();
      }
      if (this.context.state === "suspended") await this.context.resume();
    }

    volumeValue() {
      return Math.pow(state.settings.volume / 100, 1.55) * 0.82;
    }

    setMasterVolume(value) {
      state.settings.volume = Number(value);
      if (this.master && this.context) {
        this.master.gain.setTargetAtTime(this.volumeValue(), this.context.currentTime, 0.04);
      }
    }

    createNoiseBuffer(kind, seconds = 8) {
      const length = Math.floor(this.context.sampleRate * seconds);
      const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      let brown = 0;
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;

      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        if (kind === "brown" || kind === "ocean") {
          brown = (brown + 0.02 * white) / 1.02;
          data[i] = brown * 3.2;
        } else if (kind === "pink" || kind === "forest") {
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          b3 = 0.8665 * b3 + white * 0.3104856;
          b4 = 0.55 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        } else if (kind === "fire") {
          const impulse = Math.random() > 0.996 ? (Math.random() * 2 - 1) * 0.9 : 0;
          brown = (brown + 0.025 * white) / 1.025;
          data[i] = brown * 1.8 + impulse;
        } else {
          data[i] = white;
        }
      }
      return buffer;
    }

    createChannel(name, kind, filterType, frequency) {
      const source = this.context.createBufferSource();
      source.buffer = this.createNoiseBuffer(kind);
      source.loop = true;

      const filter = this.context.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = frequency;
      filter.Q.value = name === "rain" ? 0.7 : 0.25;

      const textureGain = this.context.createGain();
      textureGain.gain.value = 1;
      const output = this.context.createGain();
      output.gain.value = 0;

      source.connect(filter);
      filter.connect(textureGain);
      textureGain.connect(output);
      output.connect(this.master);
      source.start();

      if (name === "ocean") {
        const lfo = this.context.createOscillator();
        const depth = this.context.createGain();
        lfo.frequency.value = 0.075;
        depth.gain.value = 0.26;
        textureGain.gain.value = 0.65;
        lfo.connect(depth);
        depth.connect(textureGain.gain);
        lfo.start();
      }

      this.channelNodes[name] = { source, filter, output };
    }

    createChannels() {
      this.createChannel("rain", "white", "bandpass", 1500);
      this.createChannel("ocean", "ocean", "lowpass", 700);
      this.createChannel("forest", "forest", "lowpass", 2800);
      this.createChannel("fire", "fire", "highpass", 180);
      this.createChannel("pink", "pink", "lowpass", 5000);
      this.createChannel("brown", "brown", "lowpass", 900);
    }

    createTone() {
      this.tone = this.context.createOscillator();
      this.tone.type = "sine";
      this.tone.frequency.value = 432;
      this.toneGain = this.context.createGain();
      this.toneGain.gain.value = 0;
      this.tone.connect(this.toneGain);
      this.toneGain.connect(this.master);
      this.tone.start();
    }

    setMixLevels(ambientVolume = 100, frequencyVolume = state.sound.frequencyVolume) {
      this.ambientScale = Math.pow(Math.max(0, Number(ambientVolume)) / 100, 1.15);
      this.currentFrequencyVolume = Number(frequencyVolume);
      if (!this.context || !this.playing) return;
      Object.entries(this.currentChannels).forEach(([name, value]) => this.applyChannel(name, value));
      this.applyFrequency(this.currentFrequency, this.currentFrequencyVolume);
    }

    async playCurrent(levels = {}) {
      try {
        await this.ensure();
        this.currentChannels = { ...(levels.channels || state.sound.channels) };
        this.currentFrequency = Number(levels.frequency ?? state.sound.frequency);
        this.currentLabel = levels.label || selectedSoundLabel();
        this.setMixLevels(levels.ambientVolume ?? 100, levels.frequencyVolume ?? state.sound.frequencyVolume);
        this.playing = true;
        Object.entries(this.currentChannels).forEach(([name, value]) => this.applyChannel(name, value));
        this.applyFrequency(this.currentFrequency, this.currentFrequencyVolume);
        this.manageForestTones();
        updateAudioUI();
      } catch (error) {
        announce(error.message || "This browser could not start audio.", 4200);
      }
    }

    pause() {
      if (!this.context) return;
      Object.keys(this.channelNodes).forEach((name) => {
        this.channelNodes[name].output.gain.setTargetAtTime(0, this.context.currentTime, 0.06);
      });
      if (this.toneGain) this.toneGain.gain.setTargetAtTime(0, this.context.currentTime, 0.06);
      this.playing = false;
      this.manageForestTones();
      updateAudioUI();
    }

    applyChannel(name, value) {
      const node = this.channelNodes[name];
      if (!node || !this.context) return;
      const normalised = this.playing ? Math.pow(Number(value) / 100, 1.35) * 0.7 * this.ambientScale : 0;
      node.output.gain.setTargetAtTime(normalised, this.context.currentTime, 0.06);
    }

    async setChannel(name, value, start = true) {
      if (start) await this.ensure();
      if (start) this.playing = true;
      this.currentChannels = { ...state.sound.channels };
      Object.entries(this.currentChannels).forEach(([channel, level]) => this.applyChannel(channel, level));
      this.manageForestTones();
      updateAudioUI();
    }

    applyFrequency(frequency, volume) {
      if (!this.tone || !this.context) return;
      const now = this.context.currentTime;
      if (frequency) this.tone.frequency.setTargetAtTime(Number(frequency), now, 0.04);
      const amount = this.playing && frequency ? Math.pow(Number(volume) / 100, 1.35) * 0.32 : 0;
      this.toneGain.gain.setTargetAtTime(amount, now, 0.06);
    }

    async setFrequency(frequency, volume = this.currentFrequencyVolume) {
      await this.ensure();
      this.playing = true;
      this.currentFrequency = Number(frequency);
      this.currentFrequencyVolume = Number(volume);
      this.applyFrequency(this.currentFrequency, this.currentFrequencyVolume);
      updateAudioUI();
    }

    manageForestTones() {
      window.clearTimeout(this.forestTimer);
      if (!this.playing || Number(this.currentChannels.forest) <= 0 || !this.context) return;
      const schedule = () => {
        if (!this.playing || Number(this.currentChannels.forest) <= 0) return;
        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = "sine";
        const startFrequency = 1200 + Math.random() * 900;
        osc.frequency.setValueAtTime(startFrequency, now);
        osc.frequency.exponentialRampToValueAtTime(startFrequency * 1.18, now + 0.09);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.018, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.2);
        this.forestTimer = window.setTimeout(schedule, 4500 + Math.random() * 7500);
      };
      this.forestTimer = window.setTimeout(schedule, 2500 + Math.random() * 3500);
    }

    async chime(soft = false) {
      try {
        await this.ensure();
        const now = this.context.currentTime;
        const frequencies = soft ? [523.25] : [523.25, 659.25, 783.99];
        frequencies.forEach((frequency, index) => {
          const oscillator = this.context.createOscillator();
          const gain = this.context.createGain();
          const start = now + index * 0.17;
          oscillator.type = "sine";
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(this.volumeValue() * (soft ? 0.2 : 0.34), start + 0.025);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + (soft ? 0.3 : 0.55));
          oscillator.connect(gain);
          gain.connect(this.context.destination);
          oscillator.start(start);
          oscillator.stop(start + (soft ? 0.34 : 0.6));
        });
      } catch {
        announce("This browser could not play the alarm.");
      }
    }
  }

  const audio = new ClarityAudio();

  function routeTo(route, updateHash = true) {
    const target = ROUTES.includes(route) ? route : "home";
    $$("[data-view]").forEach((view) => {
      const active = view.dataset.view === target;
      view.hidden = !active;
      view.classList.toggle("is-active", active);
    });
    $$("[data-route]").forEach((button) => {
      const active = button.dataset.route === target;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    $("[data-page-title]").textContent = PAGE_TITLES[target];
    document.title = `${PAGE_TITLES[target]} | ACSIS Clarity`;
    if (target !== "home") {
      state.lastTool = target;
      saveState();
    }
    updateContinueCard();
    if (updateHash) history.replaceState(null, "", `#${target}`);
    window.scrollTo({ top: 0, behavior: state.settings.reduceMotion ? "auto" : "smooth" });
    $("#main-content").focus({ preventScroll: true });
  }

  function updateContinueCard() {
    const button = $("[data-continue]");
    const badge = $("[data-usual-badge]");
    const copy = $("[data-usual-copy]");
    if (!state.lastTool || !ROUTES.includes(state.lastTool)) {
      button.disabled = true;
      badge.textContent = "Not set yet";
      copy.textContent = "Use any area and ACSIS Clarity will remember your most recent choice on this device.";
      return;
    }
    const label = state.lastTool === "soundscapes" ? "Soundscapes" : state.lastTool[0].toUpperCase() + state.lastTool.slice(1);
    button.disabled = false;
    button.dataset.route = state.lastTool;
    button.textContent = `Continue with ${label}`;
    badge.textContent = "Ready to return";
    copy.textContent = `Return to ${label.toLowerCase()} with your most recent choices already in place.`;
  }

  function applySettings() {
    document.body.classList.toggle("reduce-motion", state.settings.reduceMotion);
    document.body.classList.toggle("low-stimulation", state.settings.lowStimulation);
    $("[data-reduce-motion]").checked = state.settings.reduceMotion;
    $("[data-low-stimulation]").checked = state.settings.lowStimulation;
    $$("[data-master-volume], [data-settings-volume]").forEach((input) => {
      input.value = state.settings.volume;
    });
    $("[data-master-volume-output]").textContent = `${state.settings.volume}%`;
    $("[data-settings-volume-output]").textContent = `${state.settings.volume}%`;
    audio.setMasterVolume(state.settings.volume);
  }

  function initialiseSettings() {
    $$("[data-open-settings]").forEach((button) => {
      button.addEventListener("click", () => $("[data-settings-dialog]").showModal());
    });
    $("[data-reduce-motion]").addEventListener("change", (event) => {
      state.settings.reduceMotion = event.target.checked;
      applySettings();
      saveState();
    });
    $("[data-low-stimulation]").addEventListener("change", (event) => {
      state.settings.lowStimulation = event.target.checked;
      applySettings();
      saveState();
    });
    $$("[data-master-volume], [data-settings-volume]").forEach((input) => {
      input.addEventListener("input", (event) => {
        state.settings.volume = Number(event.target.value);
        applySettings();
        saveState();
      });
    });
    $("[data-test-chime]").addEventListener("click", () => {
      audio.chime();
      announce("Alarm played. If you did not hear it, check your volume and silent mode.", 4200);
    });
    $("[data-clear-local]").addEventListener("click", () => {
      const confirmed = window.confirm("Clear your saved choices, notes and preferences from this device?");
      if (!confirmed) return;
      localStorage.removeItem(STORAGE_KEY);
      LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      audio.pause();
      state = mergeState(null);
      window.location.reload();
    });
  }

  let focusBlock = 1;
  let focusPhase = "focus";
  let focusSessionActive = false;
  let focusBreathingInSequence = false;
  let focusTransitionTimer = 0;

  function focusStageDuration() {
    return focusPhase === "focus" ? state.focus.focusDuration : state.focus.breakDuration;
  }

  function formatSessionLength(minutes) {
    if (minutes < 60) return minutes + " minutes";
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? hours + " hr " + remainder + " min" : hours + (hours === 1 ? " hour" : " hours");
  }

  function updateFocusStageUI() {
    const totalBlocks = Number(state.focus.blocks);
    const title = focusPhase === "focus" ? "Focus block " + focusBlock + " of " + totalBlocks : "Break before block " + (focusBlock + 1);
    $("[data-focus-mode-title]").textContent = focusSessionActive ? title : "Ready to begin";
    $("[data-focus-session-step]").textContent = focusSessionActive ? title : totalBlocks + (totalBlocks === 1 ? " block" : " blocks");
  }

  function renderFocusSetup() {
    $("[data-focus-length]").value = state.focus.focusDuration;
    $("[data-break-length]").value = state.focus.breakDuration;
    $("[data-focus-blocks]").value = state.focus.blocks;
    $("[data-focus-use-breathing]").checked = state.focus.useBreathing;
    $("[data-focus-breathing-summary]").textContent = state.focus.useBreathing ? "Included" : "Off";
    const blocks = Number(state.focus.blocks);
    const breaks = Math.max(0, blocks - 1);
    const totalMinutes = blocks * state.focus.focusDuration + breaks * state.focus.breakDuration + (state.focus.useBreathing ? state.focus.breathingLength : 0);
    const parts = [blocks + " focus " + (blocks === 1 ? "block" : "blocks") + " of " + state.focus.focusDuration + " minutes"];
    if (breaks) parts.push(breaks + " automatic " + state.focus.breakDuration + "-minute " + (breaks === 1 ? "break" : "breaks"));
    if (state.focus.useBreathing) parts.push(state.focus.breathingLength + (state.focus.breathingLength === 1 ? " minute" : " minutes") + " of breathing first");
    $("[data-focus-setup-summary]").textContent = parts.join(", ") + ". Total: " + formatSessionLength(totalMinutes) + ".";
    const sequence = $("[data-focus-sequence]");
    sequence.replaceChildren();
    for (let index = 1; index <= blocks; index += 1) {
      const focus = document.createElement("span");
      focus.className = "sequence-focus";
      focus.textContent = "Focus " + index + " · " + state.focus.focusDuration + " min";
      sequence.append(focus);
      if (index < blocks) {
        const pause = document.createElement("span");
        pause.className = "sequence-break";
        pause.textContent = "Break · " + state.focus.breakDuration + " min";
        sequence.append(pause);
      }
    }
    updateFocusStageUI();
    renderFocusAlerts();
  }

  function renderFocusAlerts() {
    const alerts = state.focus.alerts;
    $("[data-focus-alert-start]").checked = alerts.focusStart;
    $("[data-focus-alert-break]").checked = alerts.breakStart;
    $("[data-focus-alert-complete]").checked = alerts.sessionEnd;
    const enabled = [alerts.focusStart, alerts.breakStart, alerts.sessionEnd].filter(Boolean).length;
    $("[data-focus-alerts-summary]").textContent = enabled === 3 ? "All on" : enabled === 0 ? "Off" : enabled + " on";
  }

  function startFocusStage() {
    focusSessionActive = true;
    focusTimer.start();
    $("[data-focus-toggle]").textContent = "Pause session";
    updateFocusStageUI();
    applySoundChoice(state.focus.sound, "focus");
    const shouldAlert = focusPhase === "focus" ? state.focus.alerts.focusStart : state.focus.alerts.breakStart;
    if (shouldAlert) void audio.chime(true);
    announce(focusPhase === "focus" ? "Focus block " + focusBlock + " started." : "Break started.");
  }

  function scheduleFocusStage() {
    window.clearTimeout(focusTransitionTimer);
    focusTransitionTimer = window.setTimeout(startFocusStage, 850);
  }

  const focusTimer = new DeadlineTimer({
    onTick: (remaining, duration, progress) => {
      $("[data-focus-time]").textContent = formatTime(remaining);
      $("[data-focus-time]").setAttribute("aria-label", `${Math.ceil(remaining / 60)} minutes remaining`);
      $("[data-focus-ring]").style.strokeDashoffset = String(301.593 * progress);
      $("[data-focus-state]").textContent = focusTimer.running ? (focusPhase === "focus" ? "Focusing" : "Taking a break") : "Ready";
      if (focusTimer.running) {
        const task = firstActiveTask();
        $("[data-focus-guidance]").textContent = focusPhase === "focus" ? (task || "Stay with the next useful step.") : "Step away if you can. The next focus block starts automatically.";
      }
    },
    onComplete: () => {
      if (focusPhase === "focus") {
        state.focus.completedFocusBlocks += 1;
        saveState(true);
        if (focusBlock >= Number(state.focus.blocks)) {
          focusSessionActive = false;
          $("[data-focus-toggle]").textContent = "Start another session";
          $("[data-focus-state]").textContent = "Session complete";
          $("[data-focus-mode-title]").textContent = "Session complete";
          $("[data-focus-session-step]").textContent = state.focus.blocks + (Number(state.focus.blocks) === 1 ? " block complete" : " blocks complete");
          $("[data-focus-guidance]").textContent = "Take a moment to add any useful notes before you move on.";
          audio.pause();
          if (state.focus.alerts.sessionEnd) void audio.chime();
          announce("Focus session complete.", 5000);
          return;
        }
        focusPhase = "break";
        focusTimer.set(state.focus.breakDuration * 60);
        updateFocusStageUI();
        announce("Focus block complete. Your break is starting.", 4200);
        scheduleFocusStage();
        return;
      }
      focusBlock += 1;
      focusPhase = "focus";
      focusTimer.set(state.focus.focusDuration * 60);
      updateFocusStageUI();
      announce("Break complete. Focus block " + focusBlock + " is starting.", 4200);
      scheduleFocusStage();
    }
  });

  let focusBreathPhaseIndex = -1;
  const focusBreathTimer = new DeadlineTimer({
    onTick: (remaining, duration) => {
      $("[data-focus-breath-time]").textContent = formatTime(remaining) + " remaining";
      if (!focusBreathTimer.running) return;
      const phases = BREATH_PATTERNS.box;
      const elapsed = duration - remaining;
      const phaseIndex = Math.floor((elapsed % 16) / 4);
      const phase = phases[phaseIndex];
      const phaseElapsed = elapsed % 4;
      const phaseCount = Math.max(1, Math.ceil(4 - phaseElapsed));
      if (phaseIndex !== focusBreathPhaseIndex) focusBreathPhaseIndex = phaseIndex;
      $("[data-focus-breath-phase]").textContent = phase.label;
      $("[data-focus-breath-count]").textContent = String(phaseCount);
      $("[data-focus-breath-next]").textContent = phase.short;
      const orb = $("[data-focus-breath-orb]");
      orb.dataset.phaseType = phase.type;
      orb.style.transitionDuration = "4s";
      $("[data-focus-breathing-summary]").textContent = "In progress";
      $("[data-focus-time]").textContent = formatTime(remaining);
      $("[data-focus-time]").setAttribute("aria-label", `${Math.ceil(remaining)} seconds of breathing remaining`);
      $("[data-focus-ring]").style.strokeDashoffset = String(301.593 * ((duration - remaining) / duration));
      $("[data-focus-state]").textContent = "Breathing";
      $("[data-focus-guidance]").textContent = phase.label + ". " + phase.short + ". Your focus block will start automatically.";
    },
    onComplete: () => {
      $("[data-focus-breath-phase]").textContent = "Breathing complete";
      $("[data-focus-breath-count]").textContent = "✓";
      $("[data-focus-breath-time]").textContent = "00:00 remaining";
      $("[data-focus-breath-next]").textContent = "Your focus block is starting.";
      $("[data-focus-breathing-summary]").textContent = "Complete";
      $("[data-focus-breath-orb]").removeAttribute("data-phase-type");
      if (focusBreathingInSequence) {
        focusBreathingInSequence = false;
        $("[data-focus-breathing]").open = false;
        focusTimer.reset(state.focus.focusDuration * 60);
        startFocusStage();
        announce("Breathing complete. Your first focus block has started.", 4200);
      } else {
        announce("Breathing reset complete.", 4200);
      }
    }
  });

  function firstActiveTask() {
    return state.focus.tasks.find((task) => !task.done && task.text.trim())?.text.trim() || "";
  }

  function resetFocusBreathing() {
    focusBreathPhaseIndex = -1;
    focusBreathTimer.reset(state.focus.breathingLength * 60);
    $("[data-focus-breath-phase]").textContent = "Box breathing";
    $("[data-focus-breath-count]").textContent = "4";
    $("[data-focus-breath-time]").textContent = formatTime(state.focus.breathingLength * 60) + " remaining";
    $("[data-focus-breath-next]").textContent = "Inhale 4, hold 4, exhale 4, hold 4.";
    $("[data-focus-breathing-summary]").textContent = state.focus.useBreathing ? "Included" : "Off";
    $("[data-focus-breath-orb]").removeAttribute("data-phase-type");
  }

  function addSessionTask(text = "") {
    state.focus.tasks.push({ id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`, text, done: false });
    renderSessionTasks();
    saveState();
  }

  function renderSessionTasks() {
    const list = $("[data-session-task-list]");
    list.replaceChildren();
    state.focus.tasks.forEach((task, index) => {
      const row = document.createElement("div");
      row.className = "session-task-row";
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = task.done;
      check.setAttribute("aria-label", `Mark line ${index + 1} complete`);
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 180;
      input.value = task.text;
      input.placeholder = index === 0 ? "One clear task or intention" : "Add another task, step or intention";
      input.setAttribute("aria-label", `Session plan line ${index + 1}`);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-task";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove line ${index + 1}`);
      check.addEventListener("change", () => {
        task.done = check.checked;
        row.classList.toggle("is-complete", task.done);
        saveState();
      });
      input.addEventListener("input", () => {
        task.text = input.value;
        saveState();
      });
      remove.addEventListener("click", () => {
        state.focus.tasks.splice(index, 1);
        if (!state.focus.tasks.length) addSessionTask();
        else {
          renderSessionTasks();
          saveState();
        }
      });
      row.classList.toggle("is-complete", task.done);
      row.append(check, input, remove);
      list.append(row);
    });
  }

  function buildSessionOutput() {
    const tasks = state.focus.tasks.filter((task) => task.text.trim());
    const lines = [
      "ACSIS Clarity session summary",
      new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" }),
      "",
      `Focus length: ${state.focus.focusDuration} minutes`,
      `Break length: ${state.focus.breakDuration} minutes`,
      `Planned focus blocks: ${state.focus.blocks}`,
      `Completed focus blocks: ${state.focus.completedFocusBlocks}`,
      "",
      "Session plan"
    ];
    if (tasks.length) tasks.forEach((task) => lines.push(`${task.done ? "[x]" : "[ ]"} ${task.text.trim()}`));
    else lines.push("No tasks added.");
    lines.push("", "Why this matters", state.focus.impact.trim() || "Not added.");
    lines.push("", "Notes from the session", state.focus.reflection.trim() || "Not added.");
    if (state.focus.distractions.length) {
      lines.push("", "Parked for later", ...state.focus.distractions.map((item) => `- ${item}`));
    }
    lines.push("", "Saved locally with ACSIS Clarity.");
    return lines.join("\n");
  }

  async function copySessionOutput() {
    const output = buildSessionOutput();
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = output;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    announce("Session summary copied.");
  }

  function downloadSessionOutput() {
    const blob = new Blob([buildSessionOutput()], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    link.href = URL.createObjectURL(blob);
    link.download = `ACSIS-Clarity-session-${date}.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    announce("Session output saved to your downloads.");
  }

  function renderDistractions() {
    const list = $("[data-distraction-list]");
    list.replaceChildren();
    if (!state.focus.distractions.length) {
      const empty = document.createElement("li");
      empty.className = "empty-message";
      empty.textContent = "Nothing parked yet.";
      list.append(empty);
      return;
    }
    state.focus.distractions.forEach((item, index) => {
      const li = document.createElement("li");
      const text = document.createElement("span");
      const remove = document.createElement("button");
      text.textContent = item;
      remove.type = "button";
      remove.setAttribute("aria-label", `Remove ${item}`);
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        state.focus.distractions.splice(index, 1);
        saveState();
        renderDistractions();
      });
      li.append(text, remove);
      list.append(li);
    });
  }

  function channelsForSoundChoice(choice) {
    if (!choice || choice === "none") return { rain: 0, ocean: 0, forest: 0, fire: 0, pink: 0, brown: 0 };
    if (choice === "custom") return { ...state.sound.channels };
    return { ...(SOUND_PRESETS[choice]?.channels || {}) };
  }

  function applySoundChoice(choice, context = null) {
    const contextState = context ? state[context] : null;
    const frequency = Number(contextState?.frequency ?? state.sound.frequency);
    const hasTone = frequency > 0;
    const channels = channelsForSoundChoice(choice);
    const hasBackground = Object.values(channels).some((value) => Number(value) > 0);
    if (!hasBackground && !hasTone) {
      audio.pause();
      return false;
    }
    const backgroundLabel = !hasBackground
      ? ""
      : choice === "custom"
        ? "My Soundscapes mix"
        : SOUND_PRESETS[choice]?.title || "Background";
    const toneLabel = hasTone ? `${frequency} Hz` : "";
    audio.playCurrent({
      ambientVolume: hasBackground ? (contextState?.ambientVolume ?? 100) : 0,
      frequencyVolume: contextState?.frequencyVolume ?? state.sound.frequencyVolume,
      frequency,
      channels,
      label: backgroundLabel && toneLabel ? `${backgroundLabel} + ${toneLabel}` : backgroundLabel || toneLabel
    });
    return true;
  }

  function initialiseFocus() {
    $("[data-focus-breath-length]").value = state.focus.breathingLength;
    $("[data-focus-impact]").value = state.focus.impact;
    $("[data-focus-reflection]").value = state.focus.reflection;
    renderSessionTasks();
    renderDistractions();
    renderFocusSetup();
    focusTimer.reset(state.focus.focusDuration * 60);
    resetFocusBreathing();

    $("[data-focus-length]").addEventListener("input", (event) => {
      const requested = Number.parseInt(event.target.value, 10);
      if (!Number.isFinite(requested)) return;
      state.focus.focusDuration = Math.min(180, Math.max(1, requested));
      if (!focusSessionActive) focusTimer.reset(state.focus.focusDuration * 60);
      renderFocusSetup();
      saveState();
    });
    $("[data-break-length]").addEventListener("input", (event) => {
      const requested = Number.parseInt(event.target.value, 10);
      if (!Number.isFinite(requested)) return;
      state.focus.breakDuration = Math.min(60, Math.max(1, requested));
      renderFocusSetup();
      saveState();
    });
    $("[data-focus-blocks]").addEventListener("change", (event) => {
      state.focus.blocks = Number(event.target.value);
      renderFocusSetup();
      saveState();
    });
    $("[data-pomodoro-setup]").addEventListener("click", () => {
      window.clearTimeout(focusTransitionTimer);
      focusBreathTimer.reset(state.focus.breathingLength * 60);
      focusBreathingInSequence = false;
      audio.pause();
      state.focus.focusDuration = 25;
      state.focus.breakDuration = 5;
      state.focus.blocks = 4;
      focusBlock = 1;
      focusPhase = "focus";
      focusSessionActive = false;
      focusTimer.reset(25 * 60);
      renderFocusSetup();
      saveState();
      announce("Pomodoro setup ready: four 25-minute focus blocks with 5-minute breaks.", 4200);
    });
    $("[data-focus-toggle]").addEventListener("click", () => {
      if (focusBreathTimer.running) {
        focusBreathTimer.pause();
        $("[data-focus-toggle]").textContent = "Continue breathing";
        $("[data-focus-state]").textContent = "Paused";
        $("[data-focus-breathing-summary]").textContent = "Paused";
        announce("Breathing paused.");
        return;
      }
      if (focusBreathingInSequence) {
        focusBreathTimer.start();
        $("[data-focus-toggle]").textContent = "Pause breathing";
        $("[data-focus-state]").textContent = "Breathing";
        $("[data-focus-breathing-summary]").textContent = "In progress";
        return;
      }
      if (focusTimer.running) {
        focusTimer.pause();
        audio.pause();
        $("[data-focus-toggle]").textContent = "Continue session";
        $("[data-focus-state]").textContent = "Paused";
        announce("Session paused.");
        return;
      }
      void audio.ensure().catch(() => announce("The alarm could not be prepared in this browser."));
      if (focusSessionActive && focusTimer.remaining > 0) {
        startFocusStage();
        return;
      }
      window.clearTimeout(focusTransitionTimer);
      focusBlock = 1;
      focusPhase = "focus";
      focusSessionActive = true;
      focusTimer.reset(state.focus.focusDuration * 60);
      updateFocusStageUI();
      if (state.focus.useBreathing) {
        resetFocusBreathing();
        focusBreathingInSequence = true;
        $("[data-focus-breathing]").open = true;
        focusBreathTimer.start();
        $("[data-focus-toggle]").textContent = "Pause breathing";
        $("[data-focus-state]").textContent = "Breathing";
        $("[data-focus-mode-title]").textContent = "Settling before focus";
        $("[data-focus-session-step]").textContent = "Breathing first";
        return;
      }
      startFocusStage();
    });
    $("[data-focus-reset]").addEventListener("click", () => {
      window.clearTimeout(focusTransitionTimer);
      focusBreathingInSequence = false;
      focusSessionActive = false;
      focusBlock = 1;
      focusPhase = "focus";
      focusBreathTimer.reset(state.focus.breathingLength * 60);
      focusTimer.reset(state.focus.focusDuration * 60);
      audio.pause();
      $("[data-focus-toggle]").textContent = "Start session";
      $("[data-focus-state]").textContent = "Ready";
      $("[data-focus-guidance]").textContent = "Your first unfinished task will appear here when the session begins.";
      resetFocusBreathing();
      renderFocusSetup();
      announce("Session reset.");
    });
    $("[data-focus-breath-length]").addEventListener("change", (event) => {
      state.focus.breathingLength = Number(event.target.value);
      resetFocusBreathing();
      renderFocusSetup();
      saveState();
    });
    $("[data-focus-use-breathing]").addEventListener("change", (event) => {
      state.focus.useBreathing = event.target.checked;
      if (state.focus.useBreathing) $("[data-focus-breathing]").open = true;
      renderFocusSetup();
      saveState();
    });
    $("[data-focus-alert-start]").addEventListener("change", (event) => {
      state.focus.alerts.focusStart = event.target.checked;
      renderFocusAlerts();
      saveState();
    });
    $("[data-focus-alert-break]").addEventListener("change", (event) => {
      state.focus.alerts.breakStart = event.target.checked;
      renderFocusAlerts();
      saveState();
    });
    $("[data-focus-alert-complete]").addEventListener("change", (event) => {
      state.focus.alerts.sessionEnd = event.target.checked;
      renderFocusAlerts();
      saveState();
    });
    $("[data-test-focus-alert]").addEventListener("click", () => {
      void audio.ensure()
        .then(() => audio.chime(true))
        .then(() => announce("Gentle timer alert played."))
        .catch(() => announce("The timer alert could not play in this browser."));
    });
    $("[data-add-session-task]").addEventListener("click", () => addSessionTask());
    $("[data-focus-impact]").addEventListener("input", (event) => {
      state.focus.impact = event.target.value;
      saveState();
    });
    $("[data-focus-reflection]").addEventListener("input", (event) => {
      state.focus.reflection = event.target.value;
      saveState();
    });
    $("[data-copy-session]").addEventListener("click", () => void copySessionOutput());
    $("[data-save-session]").addEventListener("click", downloadSessionOutput);
    $("[data-clear-plan]").addEventListener("click", () => {
      if (!window.confirm("Clear this session plan and its notes?")) return;
      state.focus.tasks = [
        { id: `task-${Date.now()}-1`, text: "", done: false },
        { id: `task-${Date.now()}-2`, text: "", done: false }
      ];
      state.focus.impact = "";
      state.focus.reflection = "";
      $("[data-focus-impact]").value = "";
      $("[data-focus-reflection]").value = "";
      renderSessionTasks();
      saveState(true);
      announce("Session plan cleared.");
    });
    $("[data-distraction-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const input = $("[data-distraction-input]");
      const value = input.value.trim();
      if (!value) return;
      state.focus.distractions.push(value);
      input.value = "";
      saveState();
      renderDistractions();
      announce("Saved for later.");
    });
    $("[data-clear-distractions]").addEventListener("click", () => {
      if (!state.focus.distractions.length) return;
      state.focus.distractions = [];
      saveState();
      renderDistractions();
      announce("Distraction pad cleared.");
    });
  }

  let breathPhaseIndex = -1;

  function getBreathPhases() {
    if (state.breathe.pattern !== "resonance") return BREATH_PATTERNS[state.breathe.pattern];
    const cycle = 60 / Number(state.breathe.resonanceRate || 6);
    const inhale = state.breathe.resonanceRatio === "longer" ? cycle * 0.4 : cycle * 0.5;
    const exhale = cycle - inhale;
    return [
      { label: "Breathe in", short: "Then breathe out", seconds: inhale, type: "in" },
      { label: "Breathe out", short: "Then breathe in", seconds: exhale, type: "out" }
    ];
  }

  const breathTimer = new DeadlineTimer({
    onTick: (remaining, duration, progress) => {
      $("[data-breath-remaining]").textContent = `${formatTime(remaining)} remaining`;
      $("[data-breath-progress]").style.width = `${progress * 100}%`;
      if (!breathTimer.running) return;
      const phases = getBreathPhases();
      const cycleDuration = phases.reduce((sum, phase) => sum + phase.seconds, 0);
      const elapsed = duration - remaining;
      let cyclePosition = elapsed % cycleDuration;
      let selectedIndex = 0;
      let phaseElapsed = 0;
      for (let index = 0; index < phases.length; index += 1) {
        if (cyclePosition < phases[index].seconds) {
          selectedIndex = index;
          phaseElapsed = cyclePosition;
          break;
        }
        cyclePosition -= phases[index].seconds;
      }
      const phase = phases[selectedIndex];
      if (selectedIndex !== breathPhaseIndex) {
        breathPhaseIndex = selectedIndex;
        if (state.breathe.chimes && elapsed > 0.5) audio.chime(true);
      }
      const count = Math.max(1, Math.ceil(phase.seconds - phaseElapsed));
      $("[data-breath-phase]").textContent = phase.label;
      $("[data-breath-count]").textContent = count;
      $("[data-breath-next]").textContent = phase.short;
      const orb = $("[data-breath-orb]");
      orb.dataset.phaseType = phase.type;
      orb.style.transitionDuration = `${phase.seconds}s`;
    },
    onComplete: () => {
      $("[data-breath-toggle]").textContent = "Start again";
      $("[data-breath-phase]").textContent = "Session complete";
      $("[data-breath-count]").textContent = "✓";
      $("[data-breath-next]").textContent = "Return to your usual breathing.";
      $("[data-breath-orb]").removeAttribute("data-phase-type");
      audio.pause();
      audio.chime();
      announce("Breathing session complete.", 5000);
    }
  });

  function resetBreathing() {
    breathPhaseIndex = -1;
    breathTimer.reset(state.breathe.duration * 60);
    $("[data-breath-toggle]").textContent = "Start breathing";
    $("[data-breath-phase]").textContent = "Ready when you are";
    $("[data-breath-count]").textContent = Math.ceil(getBreathPhases()[0].seconds);
    $("[data-breath-next]").textContent = "Keep the breath comfortable, not forced.";
    $("[data-breath-orb]").removeAttribute("data-phase-type");
  }

  function initialiseBreathing() {
    $("[data-breath-duration]").value = state.breathe.duration;
    $("[data-breath-chimes]").checked = state.breathe.chimes;
    $("[data-resonance-rate]").value = state.breathe.resonanceRate;
    $("[data-resonance-rate-output]").textContent = Number(state.breathe.resonanceRate).toFixed(1);
    $("[data-resonance-ratio]").value = state.breathe.resonanceRatio;
    $("[data-resonance-pattern-label]").textContent = `${Number(state.breathe.resonanceRate).toFixed(1)} bpm`;
    $("[data-resonance-builder]").hidden = state.breathe.pattern !== "resonance";
    $$("[data-pattern]").forEach((button) => {
      const active = button.dataset.pattern === state.breathe.pattern;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", String(active));
      button.addEventListener("click", () => {
        state.breathe.pattern = button.dataset.pattern;
        $$("[data-pattern]").forEach((item) => {
          const selected = item === button;
          item.classList.toggle("is-active", selected);
          item.setAttribute("aria-checked", String(selected));
        });
        $("[data-resonance-builder]").hidden = state.breathe.pattern !== "resonance";
        resetBreathing();
        saveState();
      });
    });
    $$("[data-breath-help]").forEach((button) => button.addEventListener("click", () => {
      const guidance = BREATH_HELP[button.dataset.breathHelp];
      $("[data-breath-help-title]").textContent = guidance.title;
      $("[data-breath-help-copy]").textContent = guidance.copy;
      $("[data-breath-help-panel]").hidden = false;
    }));
    $("[data-close-breath-help]").addEventListener("click", () => {
      $("[data-breath-help-panel]").hidden = true;
    });
    $("[data-resonance-rate]").addEventListener("input", (event) => {
      state.breathe.resonanceRate = Number(event.target.value);
      $("[data-resonance-rate-output]").textContent = state.breathe.resonanceRate.toFixed(1);
      $("[data-resonance-pattern-label]").textContent = `${state.breathe.resonanceRate.toFixed(1)} bpm`;
      if (state.breathe.pattern === "resonance") resetBreathing();
      saveState();
    });
    $("[data-resonance-ratio]").addEventListener("change", (event) => {
      state.breathe.resonanceRatio = event.target.value;
      if (state.breathe.pattern === "resonance") resetBreathing();
      saveState();
    });
    $("[data-breath-duration]").addEventListener("change", (event) => {
      state.breathe.duration = Number(event.target.value);
      resetBreathing();
      saveState();
    });
    $("[data-breath-chimes]").addEventListener("change", (event) => {
      state.breathe.chimes = event.target.checked;
      saveState();
    });
    $("[data-breath-toggle]").addEventListener("click", () => {
      if (breathTimer.running) {
        breathTimer.pause();
        audio.pause();
        $("[data-breath-toggle]").textContent = "Continue";
        $("[data-breath-phase]").textContent = "Paused";
        announce("Breathing session paused.");
        return;
      }
      if (breathTimer.remaining <= 0) resetBreathing();
      void audio.ensure().catch(() => announce("The completion sound could not be prepared in this browser."));
      breathTimer.start();
      $("[data-breath-toggle]").textContent = "Pause";
      applySoundChoice(state.breathe.sound, "breathe");
      announce("Breathing session started. Keep the breath comfortable.", 3600);
    });
    $("[data-breath-reset]").addEventListener("click", () => {
      resetBreathing();
      audio.pause();
      announce("Breathing session reset.");
    });
    resetBreathing();
  }

  let meditationPromptIndex = -1;
  const meditationTimer = new DeadlineTimer({
    onTick: (remaining, duration, progress) => {
      $("[data-meditation-time]").textContent = formatTime(remaining);
      $("[data-meditation-progress]").style.width = `${progress * 100}%`;
      $("[data-meditation-state]").textContent = meditationTimer.running ? "Meditating" : "Ready";
      const prompts = MEDITATION_PROMPTS[state.meditation.anchor];
      const promptIndex = Math.min(prompts.length - 1, Math.floor(progress * prompts.length));
      $("[data-meditation-prompt]").textContent = prompts[promptIndex];
      $("[data-meditation-step]").textContent = `Step ${promptIndex + 1} of ${prompts.length}`;
      $("[data-meditation-next]").textContent = promptIndex < prompts.length - 1 ? `Next: ${prompts[promptIndex + 1]}` : "Final step: stay with this direction";
      if (meditationTimer.running && promptIndex !== meditationPromptIndex) {
        if (meditationPromptIndex >= 0 && state.meditation.guidancePings && remaining > 2) audio.chime(true);
        meditationPromptIndex = promptIndex;
      }
    },
    onComplete: () => {
      $("[data-meditation-toggle]").textContent = "Begin again";
      $("[data-meditation-state]").textContent = "Complete";
      $("[data-meditation-prompt]").textContent = "Take your time before moving on.";
      $("[data-meditation-next]").textContent = "Notice how you feel before you continue.";
      audio.pause();
      audio.chime();
      announce("Meditation complete.", 5000);
    }
  });

  function resetMeditation() {
    meditationPromptIndex = -1;
    meditationTimer.reset(state.meditation.duration * 60);
    $("[data-meditation-toggle]").textContent = "Begin meditation";
    $("[data-meditation-state]").textContent = "Ready";
    $("[data-meditation-prompt]").textContent = MEDITATION_PROMPTS[state.meditation.anchor][0];
    $("[data-meditation-step]").textContent = `Step 1 of ${MEDITATION_PROMPTS[state.meditation.anchor].length}`;
    $("[data-meditation-next]").textContent = `Next: ${MEDITATION_PROMPTS[state.meditation.anchor][1]}`;
  }

  function renderMeditationHelp() {
    const guidance = MEDITATION_HELP[state.meditation.anchor];
    $("[data-meditation-anchor-title]").textContent = guidance.title;
    $("[data-meditation-anchor-copy]").textContent = guidance.copy;
  }

  function initialiseMeditation() {
    $("[data-meditation-duration]").value = state.meditation.duration;
    $("[data-guidance-pings]").checked = state.meditation.guidancePings;
    const selectedAnchor = $(`input[name="anchor"][value="${state.meditation.anchor}"]`);
    if (selectedAnchor) selectedAnchor.checked = true;

    $("[data-meditation-duration]").addEventListener("change", (event) => {
      state.meditation.duration = Number(event.target.value);
      resetMeditation();
      saveState();
    });
    $$("input[name='anchor']").forEach((input) => input.addEventListener("change", (event) => {
      state.meditation.anchor = event.target.value;
      resetMeditation();
      renderMeditationHelp();
      saveState();
    }));
    $("[data-guidance-pings]").addEventListener("change", (event) => {
      state.meditation.guidancePings = event.target.checked;
      saveState();
    });
    $("[data-meditation-toggle]").addEventListener("click", () => {
      if (meditationTimer.running) {
        meditationTimer.pause();
        audio.pause();
        $("[data-meditation-toggle]").textContent = "Continue";
        $("[data-meditation-state]").textContent = "Paused";
        announce("Meditation paused.");
        return;
      }
      if (meditationTimer.remaining <= 0) resetMeditation();
      void audio.ensure().catch(() => announce("The completion sound could not be prepared in this browser."));
      meditationTimer.start();
      $("[data-meditation-toggle]").textContent = "Pause";
      applySoundChoice(state.meditation.sound, "meditation");
      audio.chime(true);
      announce("Meditation started.");
    });
    $("[data-meditation-reset]").addEventListener("click", () => {
      resetMeditation();
      audio.pause();
      announce("Meditation reset.");
    });
    resetMeditation();
    renderMeditationHelp();
  }

  function selectedSoundLabel() {
    if (state.sound.preset && SOUND_PRESETS[state.sound.preset]) return SOUND_PRESETS[state.sound.preset].title;
    const active = Object.entries(state.sound.channels).filter(([, value]) => Number(value) > 0).map(([name]) => name);
    if (state.sound.frequency) active.push(`${state.sound.frequency} Hz`);
    if (!active.length) return "No sound selected";
    if (active.length === 1) return active[0][0].toUpperCase() + active[0].slice(1);
    return "Custom mix";
  }

  function updateAudioUI() {
    const nowPlaying = $("[data-now-playing]");
    nowPlaying.hidden = !audio.playing;
    $("[data-now-playing-label]").textContent = audio.currentLabel || selectedSoundLabel();
    $("[data-sound-visual]").classList.toggle("is-playing", audio.playing);
    $("[data-sound-toggle]").textContent = audio.playing ? "Pause sound" : "Play selected mix";
  }

  function renderSoundControls() {
    $$("[data-channel]").forEach((input) => {
      const value = Number(state.sound.channels[input.dataset.channel] || 0);
      input.value = value;
      input.nextElementSibling.textContent = `${value}%`;
      input.closest("[data-channel-card]").classList.toggle("is-active", value > 0);
    });
    $$("[data-preset]").forEach((button) => button.classList.toggle("is-active", button.dataset.preset === state.sound.preset));
    $$("[data-frequency]").forEach((button) => {
      const active = Number(button.dataset.frequency) === Number(state.sound.frequency);
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", String(active));
    });
    $$("[data-sound-customizer]").forEach((mount) => {
      const context = mount.dataset.soundCustomizer;
      const contextState = state[context];
      if (!contextState) return;
      const select = $("[data-context-sound]", mount);
      if (select) select.value = contextState.sound || "none";
      $$("[data-context-channel]", mount).forEach((input) => {
        const value = Number(state.sound.channels[input.dataset.contextChannel] || 0);
        input.value = value;
        const output = input.nextElementSibling;
        if (output) output.textContent = `${value}%`;
      });
      const frequency = $("[data-context-frequency]", mount);
      if (frequency) frequency.value = String(contextState.frequency || 0);
      const ambientVolume = $("[data-context-ambient-volume]", mount);
      const ambientOutput = $("[data-context-ambient-output]", mount);
      const frequencyVolume = $("[data-context-frequency-volume]", mount);
      const frequencyOutput = $("[data-context-frequency-output]", mount);
      if (ambientVolume) ambientVolume.value = contextState.ambientVolume;
      if (ambientOutput) ambientOutput.textContent = `${contextState.ambientVolume}%`;
      if (frequencyVolume) frequencyVolume.value = contextState.frequencyVolume;
      if (frequencyOutput) frequencyOutput.textContent = `${contextState.frequencyVolume}%`;
      const summary = $("[data-context-sound-summary]", mount);
      if (summary) {
        const backgroundLabel = contextState.sound === "none"
          ? ""
          : contextState.sound === "custom"
            ? "My Soundscapes mix"
            : SOUND_PRESETS[contextState.sound]?.title || "Background";
        const toneLabel = contextState.frequency ? `${contextState.frequency} Hz` : "";
        summary.textContent = backgroundLabel && toneLabel
          ? `${backgroundLabel} + tone`
          : backgroundLabel || (toneLabel ? `${toneLabel} only` : "No sound");
      }
      const description = $("[data-context-sound-description]", mount);
      if (description) {
        if (contextState.sound === "none") {
          description.textContent = "No background layer will play.";
        } else if (contextState.sound === "custom") {
          const hasSharedSound = Object.values(state.sound.channels).some((value) => Number(value) > 0);
          description.textContent = hasSharedSound
            ? "Uses the exact rain, ocean, woodland, fire and noise levels currently saved in Soundscapes."
            : "Your shared mix is empty. Open Soundscapes or use the layer controls below to add a sound.";
        } else {
          description.textContent = SOUND_PRESETS[contextState.sound]?.description || "Optional background sound.";
        }
      }
      const helpButton = $("[data-context-frequency-help]", mount);
      if (helpButton) {
        helpButton.disabled = !contextState.frequency;
        helpButton.setAttribute("aria-label", contextState.frequency ? `About ${contextState.frequency} hertz` : "Choose a pure tone to see guidance");
      }
      const clearButton = $("[data-context-clear]", mount);
      if (clearButton) clearButton.classList.toggle("is-active", contextState.sound === "none" && !contextState.frequency);
    });
    $("[data-frequency-volume]").value = state.sound.frequencyVolume;
    $("[data-frequency-output]").textContent = `${state.sound.frequencyVolume}%`;
    const preset = state.sound.preset ? SOUND_PRESETS[state.sound.preset] : null;
    $("[data-sound-title]").textContent = preset?.title || selectedSoundLabel();
    $("[data-sound-description]").textContent = preset?.description || "Your custom mix is created on this device. Nothing is recorded or uploaded.";
    updateAudioUI();
  }

  function setPreset(key, play = true) {
    const preset = SOUND_PRESETS[key];
    if (!preset) return;
    state.sound.channels = { ...preset.channels };
    state.sound.preset = key;
    renderSoundControls();
    saveState();
    if (play) audio.playCurrent();
  }

  function initialiseSoundCustomizers() {
    const template = $("#sound-customizer-template");
    $$("[data-sound-customizer]").forEach((mount) => {
      const context = mount.dataset.soundCustomizer;
      const contextState = state[context];
      mount.append(template.content.cloneNode(true));
      const soundSelect = $("[data-context-sound]", mount);
      const ambientVolume = $("[data-context-ambient-volume]", mount);
      const frequency = $("[data-context-frequency]", mount);
      const frequencyVolume = $("[data-context-frequency-volume]", mount);
      soundSelect.value = contextState.sound || "none";
      soundSelect.addEventListener("change", () => {
        contextState.sound = soundSelect.value;
        if (audio.playing) applySoundChoice(contextState.sound, context);
        renderSoundControls();
        saveState();
      });
      $("[data-open-soundscapes]", mount).addEventListener("click", () => routeTo("soundscapes"));
      $("[data-context-clear]", mount).addEventListener("click", () => {
        contextState.sound = "none";
        contextState.frequency = 0;
        audio.pause();
        $("[data-context-frequency-help-panel]", mount).hidden = true;
        const soundChoices = $(".inline-sound-customizer", mount);
        if (soundChoices) soundChoices.open = false;
        renderSoundControls();
        saveState();
        announce("No sound selected. Sound choices minimised.");
      });
      ambientVolume.addEventListener("input", () => {
        contextState.ambientVolume = Number(ambientVolume.value);
        $("[data-context-ambient-output]", mount).textContent = `${contextState.ambientVolume}%`;
        if (audio.playing) audio.setMixLevels(contextState.sound === "none" ? 0 : contextState.ambientVolume, contextState.frequencyVolume);
        saveState();
      });
      $$("[data-context-channel]", mount).forEach((input) => input.addEventListener("input", () => {
        const name = input.dataset.contextChannel;
        const value = Number(input.value);
        state.sound.channels[name] = value;
        state.sound.preset = null;
        contextState.sound = "custom";
        applySoundChoice(contextState.sound, context);
        renderSoundControls();
        saveState();
      }));
      frequency.addEventListener("change", () => {
        contextState.frequency = Number(frequency.value);
        renderSoundControls();
        if (!contextState.frequency && contextState.sound === "none") audio.pause();
        else void applySoundChoice(contextState.sound, context);
        saveState();
      });
      frequencyVolume.addEventListener("input", () => {
        contextState.frequencyVolume = Number(frequencyVolume.value);
        $("[data-context-frequency-output]", mount).textContent = `${contextState.frequencyVolume}%`;
        if (audio.playing) {
          audio.setMixLevels(contextState.sound === "none" ? 0 : contextState.ambientVolume, contextState.frequencyVolume);
          if (contextState.frequency) void audio.setFrequency(contextState.frequency, contextState.frequencyVolume);
        }
        saveState();
      });
      $("[data-context-preview]", mount).addEventListener("click", () => {
        if (audio.playing) {
          audio.pause();
          announce("Sound preview paused.");
          return;
        }
        if (contextState.sound === "none" && !contextState.frequency) {
          announce("Choose a background sound, a pure tone, or both first.");
          return;
        }
        const started = applySoundChoice(contextState.sound, context);
        if (started) announce("Sound preview started. Begin at a low volume.");
        else announce("Your shared mix is empty. Add a sound here or in Soundscapes first.", 4200);
      });
      $("[data-context-stop]", mount).addEventListener("click", () => {
        audio.pause();
        announce("Sound stopped.");
      });
      $("[data-context-frequency-help]", mount).addEventListener("click", () => {
        const selected = Number(contextState.frequency);
        if (!selected) {
          announce("Choose a pure tone first.");
          return;
        }
        const panel = $("[data-context-frequency-help-panel]", mount);
        $("strong", panel).textContent = `${selected} Hz · ${FREQUENCY_META[selected].name}`;
        $("p", panel).textContent = FREQUENCY_META[selected].help;
        panel.hidden = false;
      });
      $("[data-close-context-frequency-help]", mount).addEventListener("click", () => {
        $("[data-context-frequency-help-panel]", mount).hidden = true;
      });
    });
  }

  function initialiseSoundscapes() {
    renderSoundControls();
    $$("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      setPreset(button.dataset.preset, true);
      announce(`${SOUND_PRESETS[button.dataset.preset].title} is playing.`);
    }));
    $$("[data-channel]").forEach((input) => input.addEventListener("input", (event) => {
      const name = event.target.dataset.channel;
      const value = Number(event.target.value);
      state.sound.channels[name] = value;
      state.sound.preset = null;
      event.target.nextElementSibling.textContent = `${value}%`;
      event.target.closest("[data-channel-card]").classList.toggle("is-active", value > 0);
      $("[data-sound-title]").textContent = "Custom mix";
      $("[data-sound-description]").textContent = "Adjust each layer until the overall sound feels comfortable.";
      audio.currentLabel = selectedSoundLabel();
      audio.setChannel(name, value, true);
      saveState();
    }));
    $$("[data-frequency]").forEach((button) => button.addEventListener("click", () => {
      const frequency = Number(button.dataset.frequency);
      state.sound.frequency = state.sound.frequency === frequency ? 0 : frequency;
      state.sound.preset = null;
      renderSoundControls();
      const hasBackground = Object.values(state.sound.channels).some((value) => Number(value) > 0);
      if (!state.sound.frequency && !hasBackground) audio.pause();
      else audio.playCurrent({
        channels: state.sound.channels,
        frequency: state.sound.frequency,
        frequencyVolume: state.sound.frequencyVolume,
        label: selectedSoundLabel()
      });
      saveState();
      announce(state.sound.frequency ? `${state.sound.frequency} Hz tone added at a low level.` : "Frequency tone turned off.");
    }));
    $$("[data-frequency-help]").forEach((button) => button.addEventListener("click", () => {
      const frequency = Number(button.dataset.frequencyHelp);
      $("[data-frequency-help-title]").textContent = `${frequency} Hz · ${FREQUENCY_META[frequency].name}`;
      $("[data-frequency-help-copy]").textContent = FREQUENCY_META[frequency].help;
      $("[data-frequency-help-panel]").hidden = false;
    }));
    $("[data-close-frequency-help]").addEventListener("click", () => {
      $("[data-frequency-help-panel]").hidden = true;
    });
    $("[data-frequency-off]").addEventListener("click", () => {
      state.sound.frequency = 0;
      renderSoundControls();
      const hasBackground = Object.values(state.sound.channels).some((value) => Number(value) > 0);
      if (!hasBackground) audio.pause();
      else audio.playCurrent({
        channels: state.sound.channels,
        frequency: 0,
        frequencyVolume: state.sound.frequencyVolume,
        label: selectedSoundLabel()
      });
      saveState();
      announce("Frequency tone turned off.");
    });
    $("[data-frequency-volume]").addEventListener("input", (event) => {
      state.sound.frequencyVolume = Number(event.target.value);
      $("[data-frequency-output]").textContent = `${state.sound.frequencyVolume}%`;
      if (audio.playing) audio.playCurrent({
        channels: state.sound.channels,
        frequency: state.sound.frequency,
        frequencyVolume: state.sound.frequencyVolume,
        label: selectedSoundLabel()
      });
      saveState();
    });
    $("[data-clear-mix]").addEventListener("click", () => {
      Object.keys(state.sound.channels).forEach((name) => { state.sound.channels[name] = 0; });
      state.sound.preset = null;
      state.sound.frequency = 0;
      renderSoundControls();
      audio.pause();
      saveState();
      announce("No sound selected.");
    });
    $("[data-sound-toggle]").addEventListener("click", () => {
      if (audio.playing) {
        audio.pause();
        announce("Sound paused.");
        return;
      }
      const hasSelection = Object.values(state.sound.channels).some((value) => Number(value) > 0) || state.sound.frequency;
      if (!hasSelection) setPreset("focus", false);
      audio.playCurrent();
      announce("Sound started. Begin with a low volume.");
    });
    $$("[data-stop-audio]").forEach((button) => button.addEventListener("click", () => {
      audio.pause();
      announce("All sound stopped.");
    }));
  }

  function initialiseInstall() {
    let installPrompt = null;
    const button = $("[data-install]");
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      button.hidden = false;
    });
    button.addEventListener("click", async () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      button.hidden = true;
    });
    window.addEventListener("appinstalled", () => announce("ACSIS Clarity has been installed."));
  }

  function initialiseWebMCP() {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool) => {
      try {
        void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {});
      } catch {
        // The app remains fully usable when WebMCP is unavailable.
      }
    };

    register({
      name: "open_clarity_area",
      title: "Open an ACSIS Clarity area",
      description: "Open the visible Focus, Breathe, Meditate or Soundscapes area without starting a session.",
      inputSchema: {
        type: "object",
        properties: {
          area: { type: "string", enum: ["focus", "breathe", "meditate", "soundscapes"] }
        },
        required: ["area"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || !["focus", "breathe", "meditate", "soundscapes"].includes(input.area)) {
          throw new Error("Choose a valid ACSIS Clarity area.");
        }
        routeTo(input.area);
        return { area: input.area, status: "open" };
      }
    });

    register({
      name: "prepare_focus_session",
      title: "Prepare a focus session",
      description: "Prepare one visible ACSIS Clarity focus block with a duration, task and optional first step. This does not start the session.",
      inputSchema: {
        type: "object",
        properties: {
          minutes: { type: "integer", enum: [10, 25, 45, 60] },
          task: { type: "string", maxLength: 140 },
          firstStep: { type: "string", maxLength: 140 }
        },
        required: ["minutes", "task"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || ![10, 25, 45, 60].includes(input.minutes) || typeof input.task !== "string") {
          throw new Error("Provide a supported duration and a task.");
        }
        window.clearTimeout(focusTransitionTimer);
        focusSessionActive = false;
        focusBreathingInSequence = false;
        focusBlock = 1;
        focusPhase = "focus";
        state.focus.focusDuration = input.minutes;
        state.focus.blocks = 1;
        focusTimer.reset(input.minutes * 60);
        state.focus.tasks = [
          { id: `task-${Date.now()}-1`, text: input.task.slice(0, 140), done: false },
          { id: `task-${Date.now()}-2`, text: typeof input.firstStep === "string" ? input.firstStep.slice(0, 140) : "", done: false }
        ];
        renderFocusSetup();
        renderSessionTasks();
        saveState(true);
        routeTo("focus");
        return { status: "prepared", minutes: input.minutes, task: state.focus.tasks[0].text, started: false };
      }
    });

    register({
      name: "prepare_soundscape",
      title: "Prepare a soundscape",
      description: "Select and display a ready-made ACSIS Clarity soundscape. This does not start audio.",
      inputSchema: {
        type: "object",
        properties: {
          preset: { type: "string", enum: ["focus", "settle", "restore", "shelter"] }
        },
        required: ["preset"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || !["focus", "settle", "restore", "shelter"].includes(input.preset)) {
          throw new Error("Choose a supported soundscape preset.");
        }
        setPreset(input.preset, false);
        routeTo("soundscapes");
        return { status: "prepared", preset: input.preset, playing: false };
      }
    });
  }

  function initialiseApp() {
    $$("[data-route]").forEach((button) => button.addEventListener("click", () => routeTo(button.dataset.route)));
    $("[data-continue]").addEventListener("click", (event) => {
      const route = event.currentTarget.dataset.route;
      if (route) routeTo(route);
    });
    window.addEventListener("hashchange", () => routeTo(window.location.hash.slice(1), false));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") return;
      focusTimer.tick();
      breathTimer.tick();
      meditationTimer.tick();
      focusBreathTimer.tick();
    });

    initialiseSettings();
    initialiseSoundCustomizers();
    initialiseFocus();
    initialiseBreathing();
    initialiseMeditation();
    initialiseSoundscapes();
    initialiseInstall();
    initialiseWebMCP();
    applySettings();
    updateContinueCard();
    routeTo(window.location.hash.slice(1) || "home", false);

    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
    }
  }

  initialiseApp();
})();
