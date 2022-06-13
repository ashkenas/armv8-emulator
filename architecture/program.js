export default class Program {
    constructor() {
        this.instructions = []
        this.currentInstruction = 0;
        this.nextInstruction = 1;
        this.bssSize = 0;
    }

    addInstruction(instruction) {
        this.instructions.push(instruction);
    }

    reserveSpace(bytes) {
        this.bssSize += bytes;
    }

    tick(cpu) {
        if (this.currentInstruction >= this.instructions.length)
            return true;

        const state = this.instructions[this.currentInstruction].tick(cpu);

        if (state.flags.newPC)
            this.nextInstruction = state.flags.newPC / 4;

        if (state.instructionComplete)
            this.currentInstruction = this.nextInstruction;

        // TODO: Push state to data path diagram {@ceiphr, expose function?}

        return false;
    }
};