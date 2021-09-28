import {Memory} from "@app/hardware/memory";

export class Gpu {
    private readonly rows: number;
    private readonly cols: number;
    private readonly resolution: number;

    /**
     * GPU memory
     */
    private memory: Memory;

    /**
     * GPU module constructor
     * @param rows
     * @param cols
     */
    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.resolution = this.rows * this.cols;
        this.memory = new Memory(this.resolution);
    }

    /**
     * Reset GPU memory
     */
    public reset(): void {
        this.memory.reset();
    }

    /**
     * Set pixel
     * @param x
     * @param y
     */
    public setPixel(x, y) {
        if (x > this.cols - 1) while (x > this.cols - 1) x -= this.cols;
        if (x < 0) while (x < 0) x += this.cols;

        if (y > this.rows - 1) while (y > this.rows - 1) y -= this.rows;
        if (y < 0) while (y < 0) y += this.rows;

        const location = x + (y * this.cols);
        this.memory.set(location, this.memory.get(location) ^ 1);
        return !this.memory.get(location);
    }

    /**
     * Render GPU memory
     */
    public render() {
        // TODO: Render GPU
    }
}