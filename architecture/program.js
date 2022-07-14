import Simulator from "./simulator";

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
        let nextAddress = this.staging.length * 4;
        
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

            this.instructions.push(new (this.staging[i].type)(...this.staging[i].args));
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
                encoding: this.instructions[this.currentInstruction]?.encodingParts
            });
        }

        simulator.setState({ wires: Object.assign(simulator.state.wires, state) });

        // TODO: Push state to data path diagram {@ceiphr, expose function?}

        return false;
    }
};