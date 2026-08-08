window.CaroVoice = (() => {
  let enabled = false;
  let token = 0;
  let currentAudio = null;
  let sdkPromise = null;

  function loadSDK() {
    if (window.puter?.ai?.txt2speech) return Promise.resolve(true);
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise(resolve => {
      const existing = document.querySelector('script[data-caro-puter]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true), { once: true });
        existing.addEventListener('error', () => resolve(false), { once: true });
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://js.puter.com/v2/';
      s.async = true;
      s.dataset.caroPuter = '1';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
    return sdkPromise;
  }

  function ready() { return Boolean(window.puter?.ai?.txt2speech); }

  function cancel() {
    token++;
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (_) {}
      currentAudio = null;
    }
  }

  async function speak(text, player = 'O') {
    if (!enabled) return false;
    const myToken = token;
    if (!(await loadSDK()) || myToken !== token || !enabled) return false;
    try {
      // xAI neural voices are much more expressive than browser/ResponsiveVoice TTS.
      // Eve: energetic/upbeat for Quỳnh Anh. Rex: confident/clear for Ba Cương.
      const audio = await window.puter.ai.txt2speech(text, {
        provider: 'xai',
        voice: player === 'O' ? 'eve' : 'rex'
      });
      if (myToken !== token || !enabled) return false;
      currentAudio = audio;
      return await new Promise(resolve => {
        audio.onended = () => { if (currentAudio === audio) currentAudio = null; resolve(myToken === token); };
        audio.onerror = () => { if (currentAudio === audio) currentAudio = null; resolve(false); };
        const p = audio.play();
        if (p?.catch) p.catch(() => resolve(false));
      });
    } catch (err) {
      console.warn('Caro AI voice unavailable:', err);
      return false;
    }
  }

  function pause(ms) {
    const myToken = token;
    return new Promise(resolve => setTimeout(() => resolve(myToken === token), ms));
  }

  async function turn(player) {
    cancel();
    if (!enabled) return;
    await speak(player === 'X' ? 'Tới lượt ba Cương.' : 'Tới lượt Quỳnh Anh.', player);
  }

  async function celebrate(player, stars) {
    cancel();
    if (!enabled) return;
    if (player === 'O') {
      await speak(`[cheerfully] Xiuuuuuuuuuuuuu! [pause] Con thắng rồi! [laugh] [pause] Con được ${stars} sao!`, 'O');
    } else {
      await speak(`[excited] Yeahhhhhhhhhhhhh! [pause] Ba thắng rồi! [pause] Ba được ${stars} sao!`, 'X');
    }
  }

  function setEnabled(value) {
    enabled = Boolean(value);
    if (enabled) loadSDK(); else cancel();
    return enabled;
  }

  loadSDK();
  return { setEnabled, isEnabled: () => enabled, ready, cancel, turn, celebrate };
})();