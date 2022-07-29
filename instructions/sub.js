import { Instruction, ArgumentType } from "@inst/instruction";
import { store, updateRegister } from "@util/reduxUtils";

class SUBInstruction extends Instruction {
    static mnemonic = 'sub';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Register];
    static restrictions = [null, null, null];

    constructor(rd, rn, rm) {
        super(0b11001011001);
        this.rd = rd;
        this.rn = rn;
        this.rm = rm;
        this.encodeInstruction();
        this.setControlSignals(1, 0, 0b10, 0, 0, 0, 0, 0, 0, 0, 1);
    }

    if(simulator) {
        return {
            readReg1: this.rn,
            readReg2: this.rm,
            writeReg: this.rd
        };
    }

    id(simulator) {
        this.opn = store.getState().registers[this.rn];
        this.opm = store.getState().registers[this.rm];

        return {
            readData1: this.opn,
            readData2: this.opm
        };
    }

    ex(simulator) {
        this.result = this.opn - this.opm;
        
        return {
            aluAction: 0b0011,
            aluResult: this.result
        };
    }

    wb(simulator) {
        store.dispatch(updateRegister(this.rd, this.result));

        return {
            writeData: this.result
        };
    }
}

export default SUBInstruction;