import { Instruction, ArgumentType } from "@inst/instruction";
import { signExtend, twoC } from "@util/formatUtils";
import { store, updateRegister } from "@util/reduxUtils";

class SUBIInstruction extends Instruction {
    static mnemonic = 'sub';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, null, 11];

    constructor(rd, rn, imm11) {
        super(0b11010001000);
        this.rd = rd;
        this.rn = rn;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(1, 1, 0b10, 0, 0, 0, 0, 0, 0, 0, 1);
    }

    if(simulator) {
        return {
            readReg1: this.rn,
            writeReg: this.rd,
            aluImm: this.imm11
        };
    }

    id(simulator) {
        this.opn = store.getState().registers[this.rn];

        return {
            readData1: this.opn
        };
    }

    ex(simulator) {
        this.result = twoC(this.opn - signExtend(this.imm11, 11n));
        
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

export default SUBIInstruction;