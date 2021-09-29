import {Keyboard} from "@app/hardware/keyboard";
import {Gpu} from "@app/hardware/gpu";
import {Audio} from "@app/hardware/audio";
import {Memory} from "@app/hardware/memory";

export interface IHardwares {
    keyboard: Keyboard,
    gpu: Gpu,
    audio: Audio,
    memory: Memory
}
