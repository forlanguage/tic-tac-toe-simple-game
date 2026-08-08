window.CaroVoice = (() => {
  const VOICES = { X: 'Vietnamese Male', O: 'Vietnamese Female' };
  let enabled = false;
  let token = 0;
  let initialized = false;

  function ready() {
    return typeof window.responsiveVoice !== 'undefined';
  }

  function ensureInit() {
    if (!ready() || initialized) return ready();
    try {
      if (typeof window.responsiveVoice.init === 'function') {
        window.responsiveVoice.init({});
      }
      initialized = true;
      return true;
    } catch (_) {
      return false;
    }
  }

  function cancel() {
    token += 1;
    if (ready()) {
      try { window.responsiveVoice.cancel(); } catch (_) {}
    }
  }

  function speak(text, player = 'O', options = {}) {
    if (!enabled || !ensureInit()) return Promise.resolve(false);
    const myToken = token;
    return new Promise(resolve => {
      try {
        window.responsiveVoice.speak(text, VOICES[player] || VOICES.O, {
          rate: options.rate ?? 0.92,
          pitch: options.pitch ?? 1.0,
          volume: options.volume ?? 1.0,
          onend: () => resolve(myToken === token),
          onerror: () => resolve(false)
        });
      } catch (_) {
        resolve(false);
      }
    });
  }

  function pause(ms) {
    const myToken = token;
    return new Promise(resolve => setTimeout(() => resolve(myToken === token), ms));
  }

  async function turn(player) {
    cancel();
    if (!enabled) return;
    if (player === 'X') {
      await speak('Tới lượt ba Cương', 'X', { rate: 0.88, pitch: 0.96 });
    } else {
      await speak('Tới lượt Quỳnh Anh', 'O', { rate: 0.90, pitch: 1.08 });
    }
  }

  async function celebrate(player, stars) {
    cancel();
    if (!enabled) return;
    if (player === 'O') {
      if (!(await speak('Xiuuuuuuuuuuuuuuuuuuu!', 'O', { rate: 0.58, pitch: 1.16 }))) return;
      if (!(await pause(520))) return;
      if (!(await speak('Con thắng rồi!', 'O', { rate: 0.82, pitch: 1.10 }))) return;
      if (!(await pause(430))) return;
      await speak(`Con được ${stars} sao!`, 'O', { rate: 0.80, pitch: 1.06 });
    } else {
      if (!(await speak('Yeahhhhhhhhhhhhhhhhhhhhh!', 'X', { rate: 0.60, pitch: 1.02 }))) return;
      if (!(await pause(500))) return;
      if (!(await speak('Ba thắng rồi!', 'X', { rate: 0.84, pitch: 0.98 }))) return;
      if (!(await pause(420))) return;
      await speak(`Ba được ${stars} sao!`, 'X', { rate: 0.82, pitch: 0.96 });
    }
  }

  function setEnabled(value) {
    enabled = Boolean(value);
    if (enabled) ensureInit();
    else cancel();
    return enabled;
  }

  return {
    setEnabled,
    isEnabled: () => enabled,
    ready,
    cancel,
    turn,
    celebrate,
    voices: VOICES
  };
})();