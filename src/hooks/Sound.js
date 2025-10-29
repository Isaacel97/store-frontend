  export const playSound = (type) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === "success") {
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // tono alto
    } else {
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // tono grave
    }

    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volumen bajo

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3); // 0.3 segundos
  };