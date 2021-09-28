export class Memory {
    private readonly memorySize: number;
    private memory: Uint8Array;

    /**
     * Memory module constructor
     * @param memorySize
     */
    constructor(memorySize: number) {
        this.memorySize = memorySize;
        this.reset();
    }

    /**
     * Get data from given memory address
     * @param memoryAddress
     */
    public get(memoryAddress: number): number {
        return this.memory[memoryAddress];
    }

    /**
     * Set data to given memory address
     * @param memoryAddress
     * @param data
     */
    public set(memoryAddress: number, data: number): void {
        this.memory[memoryAddress] = data;
    }

    /**
     * Reset memory
     */
    public reset() {
        this.memory = new Uint8Array(this.memorySize);
    }
}