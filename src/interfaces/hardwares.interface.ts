import {Keyboard} from "../hardware/keyboard";
import {Gpu} from "../hardware/gpu";
import {Audio} from "../hardware/audio";
import {Memory} from "../hardware/memory";

export interface IHardwares {
    keyboard: Keyboard,
    gpu: Gpu,
    audio: Audio,
    memory: Memory
}
