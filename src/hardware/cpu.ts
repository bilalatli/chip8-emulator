import {Memory} from "@app/hardware/memory";
import {DeviceConstants} from "@app/config/device-constants";
import {Fonts, FontSets} from "@app/config/fonts";

export class Cpu {
    private memoryStart: number = 0x200;

    private memory: Memory;
    private registers: Uint8Array;
    private stack: Uint16Array;

    private soundTimer: number;
    private delayTimer: number;
    private I: number;
    private stackPointer: number;
    private programCounter: number;

    private halted: boolean;
    private soundEnabled: boolean;

    /**
     * CPU module constructor
     */
    constructor() {
        this.memory = new Memory(DeviceConstants.MEMORY_SIZE);
        this.reset();
    }

    /**
     * Reset cpu
     */
    public reset() {
        this.memory.reset();
        this.registers = new Uint8Array(16); // Chip-8 has 16 register
        this.stack = new Uint16Array(16);
        this.soundTimer = 0;
        this.delayTimer = 0;
        this.stackPointer = -1;
        this.programCounter = this.memoryStart; // Chip-8 reserve lower addresses on memory
        this.halted = true;
        this.soundEnabled = false;
    }

    /**
     * Load rom
     * @param romBuffer
     */
    public loadRom(romBuffer) {
        // Reset CPU every rom load
        this.reset();

        this.loadFontSet(FontSets.DEFAULT);

        // TODO: Load rom data from buffer
    }

    /**
     * Load font set on memory
     * @param setName
     */
    private loadFontSet(setName: string | keyof FontSets) {
        const fontSet: [] = Fonts[setName] || FontSets.DEFAULT;
        for (let i = 0; i < fontSet.length; i++) {
            this.memory.set(i, fontSet[i]);
        }
    }
}