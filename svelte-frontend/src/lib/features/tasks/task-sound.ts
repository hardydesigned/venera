let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
	if (!Ctx) return null;
	if (!audioContext) {
		audioContext = new Ctx();
	}
	if (audioContext.state === 'suspended') {
		void audioContext.resume();
	}
	return audioContext;
}

export function playTaskSuccessSound(): void {
	const ctx = getAudioContext();
	if (!ctx) return;

	const now = ctx.currentTime;
	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0.0001, now);
	gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
	gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
	gain.connect(ctx.destination);

	const oscA = ctx.createOscillator();
	oscA.type = 'triangle';
	oscA.frequency.setValueAtTime(660, now);
	oscA.frequency.exponentialRampToValueAtTime(880, now + 0.16);
	oscA.connect(gain);
	oscA.start(now);
	oscA.stop(now + 0.18);

	const oscB = ctx.createOscillator();
	oscB.type = 'sine';
	oscB.frequency.setValueAtTime(990, now + 0.1);
	oscB.connect(gain);
	oscB.start(now + 0.1);
	oscB.stop(now + 0.24);
}
