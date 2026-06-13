/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Web Audio API synthesizer for Sentric active security console.
 * Generates distinct alerts for high-latency events and policy breaches.
 */

export function playBreachAlarm() {
  // Default to false if not set yet, matching standard system setting state
  const isEnabled = localStorage.getItem("sentric_notify_security_breach") === "true";
  if (!isEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    
    // Dynamic synth alarm: dual sound wave for industrial security alert
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "square";

    // Frequency slide for a high-intensity professional notice
    osc1.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc1.frequency.linearRampToValueAtTime(220, audioCtx.currentTime + 0.4);

    osc2.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc2.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.4);

    // Fade off quickly to not be annoying
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.4);
    osc2.stop(audioCtx.currentTime + 0.4);
  } catch (error) {
    console.warn("Sentric Audio alert blocked or context forbidden by browser policy:", error);
  }
}

export function playLatencyAlarm() {
  const isEnabled = localStorage.getItem("sentric_notify_high_latency") === "true";
  if (!isEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    
    // Quick double-frequency high pitch pulse for transmission alarms
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 high note
    osc.frequency.setValueAtTime(1046, audioCtx.currentTime + 0.08); // C6 transition

    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (error) {
    console.warn("Sentric Audio alert blocked or context forbidden by browser policy:", error);
  }
}

export function playVoiceSummary() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    
    if ("speechSynthesis" in window) {
      // Audio cue beeps
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.12);
      osc.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.24);
      
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);

      setTimeout(() => {
        const text = "Sentric Security Threat Analytics. System state is currently secure. One thousand eighty-four policy leaks intercepted. One hundred forty-two active shadow applications cataloged on internal VLANs. Overall compliance state is SOC two approved.";
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        window.speechSynthesis.cancel(); // Stop any pending speech
        window.speechSynthesis.speak(utterance);
      }, 400);
    }
  } catch (err) {
    console.warn("Speech synthesis or Web Audio failed:", err);
  }
}
