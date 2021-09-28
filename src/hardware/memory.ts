export class Memory {
    private memory: Uint8Array;

    constructor() {
        this.memory = new Uint8Array(4096);
    }
}