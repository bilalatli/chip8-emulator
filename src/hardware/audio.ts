/**
 * Definition webkitAudioContext for typescript
 */
import {AudioWaveForms} from "@app/config/audio-wave-forms";

declare global {
    interface Window {
        webkitAudioContext: AudioContext | any;
    }
}

/**
 * Audio module
 */
export class Audio {
    private readonly audioContext: AudioContext;
    private readonly gain: GainNode;
    private finish: AudioDestinationNode;
    private oscillator: OscillatorNode;

    private readonly defaultFrequency: number;

    /**
     * Audio module constructor
     */
    constructor() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        this.audioContext = new AudioContext();
        this.gain = this.audioContext.createGain();
        this.finish = this.audioContext.destination;

        this.defaultFrequency = 480;
    }

    /**
     * Play frequency
     * @param frequency
     */
    public play(frequency: number) {
        if (this.audioContext && !this.oscillator) {
            this.oscillator = this.audioContext.createOscillator()

            this.setFrequency(frequency);
            this.setWaveForm(AudioWaveForms.SQUARE);

            this.oscillator.connect(this.gain);
            this.oscillator.start();
        }
    }

    /**
     * Stop & delete oscillator
     */
    public stop() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
    }

    /**
     * Set audio waveform
     * @param audioWaveForm
     */
    public setWaveForm(audioWaveForm: AudioWaveForms) {
        if (this.oscillator) {
            this.oscillator.type = audioWaveForm;
        }
    }

    /**
     * Update & set frequency
     * @param frequency
     */
    public setFrequency(frequency: number) {
        if (this.oscillator) {
            this.oscillator.frequency.setValueAtTime(frequency || this.defaultFrequency, this.audioContext.currentTime);
        }
    }
}
