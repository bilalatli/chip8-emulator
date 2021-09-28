export class Memory {
    private memory: Uint8Array;

    constructor() {
        this.memory = new Uint8Array(4096);
    }

    public get(memoryAddress: number): number {
        return this.memory[memoryAddress];
    }

    public set(memoryAddress: number, data: number): void {
        this.memory[memoryAddress] = data;
    }

    public reset() {
        this.memory = new Uint8Array(4096);
    }
}