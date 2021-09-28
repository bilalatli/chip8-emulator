export class Keyboard {
    /**
     * Key press states
     */
    private keysPressed: [];

    /**
     * Keyboard mapping
     */
    private readonly keyboardMapping = {
        0x1: "1",
        0x2: "2",
        0x3: "3",
        0xC: "4",
        0x4: "Q",
        0x5: "W",
        0x6: "E",
        0xD: "R",
        0x7: "A",
        0x8: "S",
        0x9: "D",
        0xE: "F",
        0xA: "Z",
        0x0: "X",
        0xB: "C",
        0xF: "V"
    };

    /**
     * Constructor of keyboard module
     */
    constructor() {
        this.keysPressed = [];
        this.setEventListeners();
    }

    /**
     * On next key press
     * @param keyCode
     */
    public onNextKeyPress(keyCode: number) {

    }

    /**
     * Clear press states
     */
    public clear() {
        this.keysPressed = [];
    }

    /**
     * Check given key is pressed or not
     *
     * @param keyCode
     */
    public isKeyPressed(keyCode: number) {
        const mapKey = this.keyboardMapping[keyCode] || -1;
        return !!this.keysPressed[mapKey];
    }

    /**
     * Handler for browser keyDown event
     * @param event
     */
    private keyDown(event) {
        const key = String.fromCharCode(event.which);
        this.keysPressed[key] = true;

        for (const prop in this.keyboardMapping) {
            const keyCode = this.keyboardMapping[prop];

            if (keyCode === key) {
                this.onNextKeyPress(keyCode);
            }
        }
    }

    /**
     * Handler for browser keyUp event
     * @param event
     */
    private keyUp(event) {
        const key = String.fromCharCode(event.which);
        this.keysPressed[key] = false;
    }

    /**
     * Set event listeners for browser events
     */
    private setEventListeners() {
        window.addEventListener("keydown", this.keyDown, false);
        window.addEventListener("keyup", this.keyUp, false);
    }
}