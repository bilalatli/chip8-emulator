import axios from "axios";

declare global {
    interface Window {
        appBuffer: Uint8Array;
    }
}

export class RomGet {
    public loadRomData(romName: string) {
        axios.get(`/roms/${romName}.ch8`).then(response => {
            const encoder = new TextEncoder();
            const buffer = encoder.encode(response.data);
            window.appBuffer = buffer;
            window.emulator.loadApplication(buffer);
            window.emulator.startCycle();
        });
    }
}
