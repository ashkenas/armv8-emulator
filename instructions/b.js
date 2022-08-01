import { Instruction, ArgumentType } from "@inst/instruction";
import { store } from "@util/reduxUtils";

class BInstruction extends Instruction {
    static mnemonic = 'b';
    static syntax = [ArgumentType.Immediate];
    static restrictions = [11];

    constructor(imm11) {
        super(0b00010100000);
        this.rt = 0b00000;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(0, 0, 0b01, 0, 1, 0, 0, 0, 0, 0, 0);
    }

    if() {
        return {
            aluImm: this.imm11,
            readReg2: this.rt
        };
    }

    id() {
        this.opn = store.getState().registers[this.rt];

        return {
            readData2: this.opn
        };
    }
    
    ex(program) {
        return {
            aluAction: 0b0111,
            aluResult: this.opn,
            branchPC: Number(this.imm11) + (program.currentInstruction * 4)
        };
    }
}

export default BInstruction;