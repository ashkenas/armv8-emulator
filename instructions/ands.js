import { Instruction, ArgumentType } from "@inst/instruction";
import { store, updateRegister } from "@util/reduxUtils";

class ANDSInstruction extends Instruction {
    static mnemonic = 'ands';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Register];
    static restrictions = [null, null, null];
    
    constructor(rd, rn, rm) {
        super(0b11101010000);
        this.rd = rd;
        this.rn = rn;
        this.rm = rm;
        this.encodeInstruction();
        this.setControlSignals(1, 0, 0b11, 0, 0, 0, 0, 0, 0, 0, 1);
    }

    if() {
        return {
            readReg1: this.rn,
            readReg2: this.rm,
            writeReg: this.rd
        };
    }

    id() {
        this.opn = store.getState().registers[this.rn];
        this.opm = store.getState().registers[this.rm];

        return {
            readData1: this.opn,
            readData2: this.opm
        };
    }

    ex() {
        this.result = this.opn & this.opm;
        // simulator.registers.flags.setBit(0, this.result === 0n ? 1 : 0);
        
        return {
            aluAction: 0b1000,
            aluResult: this.result
        };
    }

    wb() {
        store.dispatch(updateRegister(this.rd, this.result));

        return {
            writeData: this.result
        };
    }
}

export default ANDSInstruction;