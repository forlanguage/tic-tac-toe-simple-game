(() => {
  const clips = {
    O: 'assets/audio/quynh-xiu.mp3',
    X: 'assets/audio/ba-yeah.mp3'
  };

  function pickVietnameseVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = speechSynthesis.getVoices();
    return voices.find(v => /^vi(-|_)/i.test(v.lang)) ||
           voices.find(v => /Vietnam|Tiếng Việt|Vietnamese/i.test(v.name)) ||
           null;
  }

  function speakVietnamese(text, { rate = 0.9, pitch = 1 } = {}) {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window)) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'vi-VN';
      u.rate = rate;
      u.pitch = pitch;
      const voice = pickVietnameseVoice();
      if (voice) u.voice = voice;
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
    });
  }

  function playClip(src) {
    return new Promise(resolve => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.onended = resolve;
      audio.onerror = resolve;
      audio.play().catch(resolve);
    });
  }

  async function celebrate(player, stars) {
    if (window.caroSoundEnabled === false) return;
    if ('speechSynthesis' in window) speechSynthesis.cancel();

    await playClip(clips[player]);
    await new Promise(r => setTimeout(r, 420));

    const text = player === 'O'
      ? `Con được ${stars} sao!`
      : `Ba được ${stars} sao!`;

    await speakVietnamese(text, {
      rate: player === 'O' ? 0.86 : 0.9,
      pitch: player === 'O' ? 1.12 : 1.0
    });
  }

  window.CaroAudio = {
    celebrate,
    speakTurn(player) {
      if (window.caroSoundEnabled === false) return;
      const text = player === 'X' ? 'Tới lượt ba Cương' : 'Tới lượt Quỳnh Anh';
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      return speakVietnamese(text, { rate: 0.9, pitch: player === 'O' ? 1.08 : 1.0 });
    }
  };
})();
