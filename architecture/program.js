export default class Program {
    constructor() {
        this.instructions = []
        this.currentInstruction = 0;
        this.nextInstruction = 1;
    }

    addInstruction(instruction) {
        this.instructions.push(instruction);
    }

    tick(cpu) {
        if (this.currentInstruction >= this.instructions.length)
            return true;

        const state = this.instructions[this.currentInstruction].tick(cpu);

        if (state.flags.branch) {
            this.awaitingNextInstruction = true;
        } else if (this.awaitingNextInstruction) {
            this.awaitingNextInstruction = false;
            this.nextInstruction = this.currentInstruction + (this.instructions[this.currentInstruction].nextInstruction / 32);
        }

        if (state.instructionComplete) {
            this.currentInstruction = this.nextInstruction;
            this.nextInstruction = this.currentInstruction + 1;
        }

        // TODO: Push state to data path diagram {@ceiphr, expose function?}

        return false;
    }
};