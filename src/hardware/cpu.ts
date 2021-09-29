import {Memory} from "@app/hardware/memory";
import {DeviceConstants} from "@app/config/device-constants";
import {Fonts, FontSets} from "@app/config/fonts";
import {IHardwares} from "@app/interfaces/hardwares-insterface";

export class Cpu {
    /**
     * Carry flag definition
     */
    private CarryFlag = 0xF;

    private hardwares: IHardwares;

    private memoryStart: number = 0x200;

    private registers: Uint8Array;
    private stack: Array<number>;

    private soundTimer: number;
    private delayTimer: number;

    /**
     * 16bit register for memory address [Like void pointer]
     */
    private I: number;

    private stackPointer: number;
    private programCounter: number;

    /**
     * Cycle blocking operation
     * 0xFX0A : A key press is awaited, and then stored in VX. (Blocking Operation. All instruction halted until next key event)
     */
    private isPaused: boolean = false;

    private soundEnabled: boolean;

    /**
     * CPU clock rate
     */
    private clockRate: number = 10;

    /**
     * CPU module constructor
     */
    constructor(hardwares: IHardwares) {
        this.hardwares = hardwares;
        this.reset();
    }

    /**
     * Reset cpu
     */
    public reset() {
        this.hardwares.memory.reset();
        this.registers = new Uint8Array(16); // Chip-8 has 16 register
        this.stack = [];
        this.soundTimer = 0;
        this.delayTimer = 0;
        this.stackPointer = -1;
        this.programCounter = this.memoryStart; // Chip-8 reserve lower addresses on memory
        this.isPaused = false;
        this.soundEnabled = false;
        this.I = 0x00;

        this.loadFontSet(FontSets.DEFAULT);
    }

    /**
     * Load rom
     * @param buffer
     */
    public loadRom(buffer: Uint8Array) {
        // Reset CPU every rom load
        this.reset();

        for (let i = 0; i < buffer.length; i++) {
            this.hardwares.memory.set(this.memoryStart + i, buffer[i]);
        }
    }

    /**
     * Load font set on memory
     * @param setName
     */
    private loadFontSet(setName: string | keyof FontSets) {
        const fontSet: [] = Fonts[setName] || FontSets.DEFAULT;
        for (let i = 0; i < fontSet.length; i++) {
            this.hardwares.memory.set(i, fontSet[i]);
        }
    }

    /**
     * Update cpu timers
     */
    private updateTimers() {
        if (this.delayTimer > 0) {
            this.delayTimer = 0;
        }

        if (this.soundTimer > 0) {
            this.hardwares.audio.play(480);
            this.soundTimer = 0;
        } else {
            this.hardwares.audio.stop();
        }
    }

    /**
     * Fetch current OPCode
     */
    private fetch() {
        /**
         * 0xAN | 0xNN = 2 Bytes long instruction
         * 0xAN << 8 : 0xAN00
         * 0xAN00 | 0xNN : 0xANNN = This is our OPCode
         */

        let f1 = this.hardwares.memory.get(this.programCounter);
        let f2 = this.hardwares.memory.get(this.programCounter + 1);

        return (f1 << 8) | f2;
    }

    /**
     * Main CPU cycle
     */
    private run() {
        for (let i = 0; i < this.clockRate; i++) {
            if (!this.isPaused) {
                let opcode = this.fetch();
                this.execute(opcode);
            }
        }
    }

    /**
     * Execute opcode
     *
     * @param opcode
     */
    private execute(opcode: number) {
        /**
         * Each opcode is 2 bytes long. So we increase program counter for prepare next instruction
         */
        this.programCounter += 0x2;

        let X = (opcode & 0x0F00) >> 0x8; // Take second byte in opcode [ >> 8 ]
        let Y = (opcode & 0x00F0) >> 0x4; // Take third byte in opcode [ >> 4 ]

        switch (opcode & 0xF000) {
            case 0x0000:
                switch (X) {
                    case 0x0:
                        switch (opcode) {
                            case 0x00E0:
                                // Clear GPU Memory
                                this.hardwares.gpu.reset();
                                break;
                            case 0x00EE:
                                // Returns from a subroutine
                                this.programCounter = this.stack.pop();
                                break;
                        }
                        break;
                    default:
                        // 0x0NNN : Calls machine code routing
                        break;
                }
                break;
            case 0x1000:
                // Jumps to address NNN
                this.programCounter = (opcode & 0x0FFF);
                break;
            case 0x2000:
                // Calls subroutine at NNN
                this.stack.push(this.programCounter);
                this.programCounter = (opcode & 0xFFF);
                break;
            case 0x3000:
                // Skips the next instruction if VX equals NN. (Usually the next instruction is a jump to skip a code block)
                if (this.registers[X] === (opcode & 0xFF)) {
                    this.programCounter += 0x2;
                }
                break;
            case 0x4000:
                // Skips the next instruction if VX doesn't equal NN. (Usually the next instruction is a jump to skip a code block)
                if (this.registers[X] !== (opcode & 0xFF)) {
                    this.programCounter += 0x2;
                }
                break;
            case 0x5000:
                // Skips the next instruction if VX equals VY. (Usually the next instruction is a jump to skip a code block)
                if (this.registers[X] === this.registers[Y]) {
                    this.programCounter += 0x2;
                }
                break;
            case 0x6000:
                // Sets VX to NN
                this.registers[X] = (opcode & 0xFF);
                break;
            case 0x7000:
                // Adds NN to VX (Carry flag is not changed)
                this.registers[X] += (opcode & 0xFF);
                break;
            case 0x8000:
                switch (opcode & 0xF) {
                    case 0x0:
                        // Sets VX to the value of VY.
                        this.registers[X] = this.registers[Y];
                        break;
                    case 0x1:
                        // Sets VX to VX or VY. (Bitwise OR operation)
                        this.registers[X] |= this.registers[Y];
                        break;
                    case 0x2:
                        // Sets VX to VX and VY. (Bitwise AND operation)
                        this.registers[X] &= this.registers[Y];
                        break;
                    case 0x3:
                        // Sets VX to VX xor VY.
                        this.registers[X] ^= this.registers[Y];
                        break;
                    case 0x4:
                        // Adds VY to VX. VF is set to 1 when there's a carry, and to 0 when there isn't.
                        this.registers[X] += this.registers[Y];
                        this.registers[this.CarryFlag] = ((this.registers[X] > 0xFF ? 0x1 : 0x0));
                        break;
                    case 0x5:
                        // VY is subtracted from VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
                        this.registers[this.CarryFlag] = (this.registers[X] > this.registers[Y] ? 0x1 : 0x0);
                        this.registers[X] -= this.registers[Y];
                        break;
                    case 0x6:
                        // Stores the least significant bit of VX in VF and then shifts VX to the right by 1
                        this.registers[this.CarryFlag] = this.registers[X] & 0x1;
                        this.registers[X] >>= 0x1;
                        break;
                    case 0x7:
                        // Sets VX to VY minus VX. VF is set to 0 when there's a borrow, and 1 when there isn't
                        this.registers[this.CarryFlag] = (this.registers[Y] > this.registers[X] ? 0x1 : 0x0);
                        this.registers[X] = this.registers[Y] - this.registers[X];
                        break;
                    case 0xE:
                        // TODO: Check most significant bit
                        // Stores the most significant bit of VX in VF and then shifts VX to the left by 1
                        this.registers[this.CarryFlag] = this.registers[X] & 0x80;
                        this.registers[X] <<= 0x1;
                        break;
                }
                break;
            case 0x9000:
                // Skips the next instruction if VX doesn't equal VY (Usually the next instruction is a jump to skip a code block)
                if (this.registers[X] !== this.registers[Y]) {
                    this.programCounter += 0x2;
                }
                break;
            case 0xA000:
                // Sets I to the address NNN
                this.I = (opcode & 0xFFF);
                break;
            case 0xB000:
                // Jumps to the address NNN plus V0
                this.programCounter = (opcode & 0xFFF) + this.registers[0];
                break;
            case 0xC000:
                // Sets VX to the result of a bitwise *and* operation on a *random* number (Typically: 0 to 255) and NN
                // Let's be realistic :) Known random numbers are never random without entropy. But we can use Math.random() for our purpose
                let neverRandom = Math.floor(Math.random() * 0xFF);
                this.registers[X] = neverRandom & (opcode & 0xFF);
                break;
            case 0xD000:
                // Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N+1 pixels.
                // Each row of 8 pixels is read as bit-coded starting from memory location I;
                // I value doesn’t change after the execution of this instruction.
                // As described above, VF is set to 1 *if any screen pixels are flipped* from set to unset when the sprite is drawn, and to 0 if that doesn’t happen
                let W = 8; // Sprite Width
                let H = (opcode & 0xF); // Sprite Height

                // Set carry flag is 0x0
                this.registers[this.CarryFlag] = 0x0;

                for (let i = 0; i < H; i++) {
                    let spriteRow = this.hardwares.memory.get(this.I + i);

                    for (let a = 0; a < W; a++) {
                        // TODO: Most significant bit check
                        let spriteCol = (spriteRow & 0x80); // 0x80 = 1000 0000 , First bit in spriteRow
                        if (this.hardwares.gpu.setPixel(this.registers[X], this.registers[Y])) {
                            // Set carry flag is 0x1 if any pixel collision detect
                            this.registers[this.CarryFlag] = 0x1;
                        }

                        // Example;
                        // Our sprite is : 0b10100110
                        // We write first bit into gpu memory than we need to shift 1 bit left
                        // Remaining sprite : 0b0100110
                        spriteRow <<= 0x1;
                    }
                }
                break;
            case 0xE000:
                switch (opcode & 0xFF) {
                    case 0x9E:
                        // Skips the next instruction if the key stored in VX is pressed. (Usually the next instruction is a jump to skip a code block)
                        if (this.hardwares.keyboard.isKeyPressed(this.registers[X])) {
                            this.programCounter += 0x2;
                        }
                        break;
                    case 0xA1:
                        // Skips the next instruction if the key stored in VX isn't pressed. (Usually the next instruction is a jump to skip a code block)
                        if (!this.hardwares.keyboard.isKeyPressed(this.registers[X])) {
                            this.programCounter += 0x2;
                        }
                        break;
                }
                break;
            case 0xF000:
                switch (opcode & 0xFF) {
                    case 0x07:
                        // Sets VX to the value of the delay timer.
                        this.registers[X] = this.delayTimer;
                        break;
                    case 0x0A:
                        // A key press is awaited, and then stored in VX. (Blocking Operation. All instruction halted until next key event)
                        this.isPaused = true;

                        this.hardwares.keyboard.onNextKeyPress = function (key) {
                            this.registers[X] = key;
                            this.isPaused = false;
                        }.bind(this);
                        break;
                    case 0x15:
                        // Sets the delay timer to VX.
                        this.delayTimer = this.registers[X];
                        break;
                    case 0x18:
                        // Sets the sound timer to VX.
                        this.soundTimer = this.registers[X];
                        break;
                    case 0x1E:
                        // Adds VX to I. VF is not affected
                        this.I += this.registers[X];
                        break;
                    case 0x29:
                        // Sets I to the location of the sprite for the character in VX. Characters 0-F (in hexadecimal) are represented by a 4x5 font.
                        this.I = this.registers[X] * 5; // Each sprite is 5 byte. Ex : 3rd sprite location is 3 * (5 Byte) = 15th byte
                        break;
                    case 0x33:
                        // Stores the binary-coded decimal representation of VX, with the most significant of three digits at the address in I,
                        // the middle digit at I plus 1, and the least significant digit at I plus 2. (In other words, take the decimal representation of VX,
                        // place the hundreds digit in memory at location in I, the tens digit at location I+1, and the ones digit at location I+2.)
                        // noinspection PointlessArithmeticExpressionJS
                        this.hardwares.memory.set(this.I + 0x0, Math.floor(this.registers[X] / 100)); // Get hundreds digit of VX
                        this.hardwares.memory.set(this.I + 0x1, Math.floor((this.registers[X] % 100) / 10)); // Get tens digit of VX
                        this.hardwares.memory.set(this.I + 0x2, this.registers[X] % 10); // Get ones digit of VX
                        break;
                    case 0x55:
                        // Stores V0 to VX (including VX) in memory starting at address I.
                        // The offset from I is increased by 1 for each value written, but I itself is left unmodified
                        for (let i = 0; i <= X; i++) {
                            // V{i} : V0 <-> VX
                            this.hardwares.memory.set((this.I + i), this.registers[i]);
                        }
                        break;
                    case 0x65:
                        // Fills V0 to VX (including VX) with values from memory starting at address I.
                        // The offset from I is increased by 1 for each value written, but I itself is left unmodified
                        for (let i = 0; i <= X; i++) {
                            // V{i} : V0 <-> VX
                            this.registers[i] = this.hardwares.memory.get(this.I + i);
                        }
                        break;
                }

                break;
        }
    }
}
