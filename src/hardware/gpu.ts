import {Memory} from "./memory";
import {WebConstants} from "../config/web-constants";

export class Gpu {
    private readonly rows: number;
    private readonly cols: number;
    private readonly resolution: number;
    private readonly viewScale: number = 1;

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    /**
     * GPU memory
     */
    private memory: Memory;

    /**
     * GPU module constructor
     * @param rows
     * @param cols
     * @param viewScale
     */
    constructor(rows: number, cols: number, viewScale: number) {
        this.viewScale = viewScale;
        this.rows = rows;
        this.cols = cols;
        this.resolution = this.rows * this.cols;
        this.memory = new Memory(this.resolution);

        this.initializeWebScreen();
    }

    /**
     * Initialize web screen
     */
    public initializeWebScreen() {
        this.canvas = <HTMLCanvasElement>document.querySelector(WebConstants.CANVAS_SELECTOR);
        this.context = this.canvas.getContext('2d');
        this.canvas.width = this.cols * this.viewScale;
        this.canvas.height = this.rows * this.viewScale;
    }

    /**
     * Render single pixel on draw context (Width & height calculated with viewScale)
     * @param x
     * @param y
     * @param color
     */
    public renderPixel(x: number, y: number, color = '#000') {
        // Get screen positions of X&Y
        let screenX = this.viewScale * x;
        let screenY = this.viewScale * y;

        this.context.fillStyle = color;
        this.context.fillRect(screenX, screenY, this.viewScale, this.viewScale);
    }

    /**
     * Render all graphic memory on web screen
     */
    public render() {
        this.clearWebScreen();

        for (let i = 0; i < this.resolution; i++) {
            if (this.memory.get(i)) {
                let cordX = (i % this.cols);
                let cordY = Math.floor(i / this.cols);

                this.renderPixel(cordX, cordY);
            }
        }
    }

    /**
     * Clear web screen
     */
    public clearWebScreen() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Reset GPU memory
     */
    public reset() {
        this.memory.reset();
    }

    /**
     * Flip pixel
     *
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
}
