import { nextMultiple } from "@util/formatUtils";
import { store, merge, updateControlSignals, updateWires } from "@util/reduxUtils";

/**
 * Represent an unencoded instruction.
 */
class StagedInstruction {
    constructor(instructionType, instructionArgs, lineNumber, lineText) {
        this.type = instructionType;
        this.args = instructionArgs;
        this.lineNumber = lineNumber;
        this.lineText = lineText;
    }
}

/**
 * Represents an assembly program.
 */
export default class Program {
    constructor() {
        this.instructions = [];
        this.staging = [];
        this.initData = [];
        this.labels = {};
        this.initSize = 0;
        this.bssSize = 0;
        this.currentInstruction = 0;
        this.nextInstruction = 1;
        this.startLabel = null;
        this.exit = false;
    }

    /**
     * Add an instruction to the program.
     * @param {Instruction} instructionType A class that extends `Instruction`
     * @param {any[]} instructionArgs Arguments for the instruction
     * @param {number} lineNumber File line number where instruction occurs
     * @param {string} lineText Instruction text as given in file
     */
    addInstruction(instructionType, instructionArgs, lineNumber, lineText) {
        this.staging.push(new StagedInstruction(instructionType, instructionArgs, lineNumber, lineText));
    }

    /**
     * Add a piece of initialized data.
     * @param {bigint} value Data value
     * @param {number} length Byte length of data
     */
    addInitializedData(value, length) {
        this.initData.push({
            value: value,
            length: length,
            address: (this.staging.length * 4) + this.initSize + this.bssSize
        });
        this.initSize += length;
    }

    /**
     * Reserve space for uninitialized data.
     * @param {number} length Byte length of space to reserve
     */
    addUninitializedData(length) {
        this.bssSize += length;
    }

    /**
     * Align the initialized data section on a boundary of
     * a multiple of `bytes` bytes.
     * @param {number} bytes 
     */
    alignInitializedData(bytes) {
        this.addInitializedData('', 0n, nextMultiple(this.initSize, bytes) - this.initSize);
    }

    /**
     * Align the bss section on a boundary of
     * a multiple of `bytes` bytes.
     * @param {number} bytes 
     */
    alignUninitializedData(bytes) {
        this.addUninitializedData('', 0n, nextMultiple(this.bssSize + this.initSize, bytes) - (this.bssSize + this.initSize));
    }

    /**
     * Add a label at the current program position.
     * @param {string} label Label text
     */
    addLabel(label) {
        this.labels[label] = this.staging.length * 4 + this.initSize + this.bssSize;
    }

    /**
     * Replace all string labels in instructions
     * with their appropriate integer values.
     */
    runSubstitutions() {
        this.programSize = this.staging.length * 4;

        for(let i = 0; i < this.staging.length; i++) {
            this.staging[i].args = this.staging[i].args.map((arg) => {
                if (typeof arg === 'string') {
                    if (this.labels[arg] !== undefined) {
                        return BigInt(this.labels[arg] - (i * 4));
                    } else
                        throw `Line ${this.staging[i].lineNumber + 1}: ${this.staging[i].lineText}\n\nLabel '${arg}' not found.`;
                }
                return arg;
            });

            const instruction = new (this.staging[i].type)(...this.staging[i].args);
            instruction.lineNumber = this.staging[i].lineNumber;
            instruction.lineText = this.staging[i].lineText;
            this.instructions.push(instruction);
        }

        if (this.startLabel && this.labels[this.startLabel]) {
            this.currentInstruction = this.labels[this.startLabel] / 4;
            this.nextInstruction = this.currentInstruction + 1;
        }
    }

    /**
     * Run one cycle of the current instruction.
     * @returns {boolean} If the program has concluded.
     */
    tick() {
        if (this.exit || this.currentInstruction >= this.instructions.length)
            return true;

        const state = this.instructions[this.currentInstruction].tick(this);

        if (this.instructions[this.currentInstruction].cycle === 2) {
            store.dispatch(updateControlSignals(this.instructions[this.currentInstruction].controlSignals));
        }

        if (state.flags.newPC !== undefined)
            this.nextInstruction = state.flags.newPC / 4;

        if (state.flags.exit)
            this.exit = true;

        if (state.instructionComplete) {
            this.currentInstruction = this.nextInstruction;
            if (this.currentInstruction < this.instructions.length) {
                store.dispatch(merge({
                    encoding: this.instructions[this.currentInstruction]?.encodingParts,
                    lineNumber: this.instructions[this.currentInstruction]?.lineNumber
                }));
            }
        }

        store.dispatch(updateWires(state.flags));

        return false;
    }
};