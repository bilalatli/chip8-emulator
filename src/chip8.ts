import {IHardwares} from "./interfaces/hardwares.interface";
import {Cpu} from "./hardware/cpu";
import {Memory} from "./hardware/memory";
import {Audio as DeviceAudio} from "./hardware/audio";
import {DeviceConstants} from "./config/device-constants";
import {Gpu} from "./hardware/gpu";
import {Keyboard} from "./hardware/keyboard";
import {RomGet} from "./library/rom-get";

declare global {
    interface Window {
        emulator: Chip8;
        romLoader: RomGet
    }
}

export class Chip8 {
    private fps: number = 60;
    private fpsInterval: number = 1000 / this.fps;
    private frame = null;
    private isInitialized: boolean = false;

    private bootTime = Date.now();
    private lastTickTime = this.bootTime;
    private currentTime = this.bootTime;
    private elapsed: number = 0;

    private hardwares: IHardwares;
    private cpu: Cpu;

    /**
     * Chip-8 constructor
     */
    constructor() {
        this.initialize();
    }

    /**
     * Initialize method
     */
    public initialize() {
        if (!this.isInitialized) {
            this.hardwares = {
                memory: new Memory(DeviceConstants.MEMORY_SIZE),
                audio: new DeviceAudio(),
                gpu: new Gpu(DeviceConstants.DISPLAY_WIDTH, DeviceConstants.DISPLAY_HEIGHT, DeviceConstants.VIEW_SCALE),
                keyboard: new Keyboard(),
            };

            this.cpu = new Cpu(this.hardwares);
        }
    }

    /**
     * Reset chip-8 device
     */
    public reset() {
        this.cpu.reset();
    }

    /**
     * Load application
     * @param romBuffer
     */
    public loadApplication(romBuffer: Uint8Array) {
        this.cpu.loadRom(romBuffer);
    }

    /**
     * Request animation frame
     */
    public startCycle() {
        this.frame = requestAnimationFrame(this.cycle.bind(this)) || webkitRequestAnimationFrame(this.cycle.bind(this));
    }

    /**
     * CPU cycle
     */
    public cycle() {
        this.currentTime = Date.now();
        this.elapsed = this.currentTime - this.lastTickTime;

        if ((this.elapsed / 1000) > this.fpsInterval) {
            this.lastTickTime = this.currentTime;
            this.cpu.run();
        }

        this.frame = requestAnimationFrame(this.cycle.bind(this)) || webkitRequestAnimationFrame(this.cycle.bind(this));
    }
}

window.emulator = new Chip8();
window.romLoader = new RomGet();
