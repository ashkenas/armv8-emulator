/**
 * Represent an unencoded instruction.
 */
class StagedInstruction {
    constructor(instructionType, instructionArgs) {
        this.type = instructionType;
        this.args = instructionArgs;
    }
}

/**
 * Represents an assembly program.
 */
export default class Program {
    constructor() {
        this.instructions = [];
        this.staging = [];
        this.initData = {};
        this.uninitData = {};
        this.labels = {};
        this.currentInstruction = 0;
        this.nextInstruction = 1;
        this.bssSize = 0;
    }

    /**
     * Add an instruction to the program.
     * @param {Instruction} instructionType A class that extends `Instruction` 
     * @param {any[]} instructionArgs Arguments for the instruction
     */
    addInstruction(instructionType, instructionArgs) {
        this.staging.push(new StagedInstruction(instructionType, instructionArgs));
    }

    /**
     * Add a piece of initialized data.
     * @param {string} label Label text
     * @param {bigint} value Data value
     * @param {number} length Byte length of data
     */
    addInitializedData(label, value, length) {
        this.initData[label] = { value: value, length: length };
    }

    /**
     * Reserve space for uninitialized data.
     * @param {string} label Label text
     * @param {number} length Byte length of space to reserve
     */
    addUninitializedData(label, length) {
        this.uninitData[label] = length;
    }

    /**
     * Add a label at the current program position.
     * @param {string} label Label text
     */
    addLabel(label) {
        this.labels[label] = this.instructions.length;
    }

    /**
     * Replace all string labels in instructions
     * with their appropriate integer values.
     */
    runSubstitutions() {
        // TODO: Implement proper substitutions
    }

    /**
     * Run one cycle of the current instruction.
     * @param {CPU} cpu The CPU to run the instruction on.
     * @returns {boolean} If the program has concluded.
     */
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