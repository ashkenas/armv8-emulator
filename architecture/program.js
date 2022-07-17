import Simulator from "./simulator";

/**
 * Represent an unencoded instruction.
 */
class StagedInstruction {
    constructor(instructionType, instructionArgs, lineNumber) {
        this.type = instructionType;
        this.args = instructionArgs;
        this.lineNumber = lineNumber;
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
        this.initSize = 0;
        this.bssSize = 0;
        this.currentInstruction = 0;
        this.nextInstruction = 1;
    }

    /**
     * Add an instruction to the program.
     * @param {Instruction} instructionType A class that extends `Instruction` 
     * @param {any[]} instructionArgs Arguments for the instruction
     */
    addInstruction(instructionType, instructionArgs, lineNumber) {
        this.staging.push(new StagedInstruction(instructionType, instructionArgs, lineNumber));
    }

    /**
     * Add a piece of initialized data.
     * @param {string} label Label text
     * @param {bigint} value Data value
     * @param {number} length Byte length of data
     */
    addInitializedData(label, value, length) {
        if (typeof value !== 'bigint')
            throw 'addInitializedData: value must be type bigint!';
        this.initData[label] = { value: value, length: length };
        this.initSize += length;
    }

    /**
     * Reserve space for uninitialized data.
     * @param {string} label Label text
     * @param {number} length Byte length of space to reserve
     */
    addUninitializedData(label, length) {
        this.uninitData[label] = length;
        this.bssSize += length;
    }

    /**
     * Align the initialized data section on a boundary of
     * a multiple of `bytes` bytes.
     * @param {number} bytes 
     */
    alignInitializedData(bytes) {
        this.addInitializedData('', 0n, (bytes - (this.initSize % bytes)) % bytes);
    }

    /**
     * Align the bss section on a boundary of
     * a multiple of `bytes` bytes.
     * @param {number} bytes 
     */
    alignUninitializedData(bytes) {
        this.addUninitializedData('', 0n, (bytes - ((this.bssSize + this.initSize) % bytes)) % bytes);
    }

    /**
     * Add a label at the current program position.
     * @param {string} label Label text
     */
    addLabel(label) {
        this.labels[label] = this.staging.length * 4;
    }

    /**
     * Replace all string labels in instructions
     * with their appropriate integer values.
     */
    runSubstitutions() {
        this.programSize = (this.staging.length + (this.staging.length % 2)) * 4;
        let nextAddress = this.programSize;
        
        for(const label of Object.keys(this.initData)) {
            this.initData[label].address = nextAddress;
            this.labels[label] = nextAddress;
            nextAddress += this.initData[label].length;
        }
        
        for(const label of Object.keys(this.uninitData)) {
            this.labels[label] = nextAddress;
            nextAddress += this.uninitData[label];
        }

        for(let i = 0; i < this.staging.length; i++) {
            this.staging[i].args = this.staging[i].args.map((arg) => {
                if (typeof arg === 'string') {
                    if (this.labels[arg]) {
                        if (this.initData[arg] || this.uninitData[arg]) // data value, use address
                            return BigInt(this.labels[arg]);
                        else // branch label, compute offset
                            return BigInt(this.labels[arg] - (i * 4));
                    }
                    else
                        throw `Parsing Error: Label '${arg}' not found.`;
                }

                return arg;
            });

            const instruction = new (this.staging[i].type)(...this.staging[i].args);
            instruction.lineNumber = this.staging[i].lineNumber;
            this.instructions.push(instruction);
        }
    }

    /**
     * Run one cycle of the current instruction.
     * @param {Simulator} simulator The simulator to run the instruction on.
     * @returns {boolean} If the program has concluded.
     */
    tick(simulator) {
        if (this.currentInstruction >= this.instructions.length)
            return true;

        const state = this.instructions[this.currentInstruction].tick(simulator);

        if (this.instructions[this.currentInstruction].cycle == 2) {
            simulator.setState({
                controlSignals: this.instructions[this.currentInstruction].controlSignals
            });
        }

        if (state.flags.newPC)
            this.nextInstruction = state.flags.newPC / 4;

        if (state.instructionComplete) {
            this.currentInstruction = this.nextInstruction;
            simulator.setState({
                encoding: this.instructions[this.currentInstruction]?.encodingParts,
                lineNumber: this.instructions[this.currentInstruction]?.lineNumber
            });
        }

        simulator.setState({ wires: Object.assign(simulator.state.wires, state) });

        return false;
    }
};