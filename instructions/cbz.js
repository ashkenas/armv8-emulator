import { Instruction, ArgumentType } from "@inst/instruction";
import { store } from "@util/reduxUtils";

class CBZInstruction extends Instruction {
    static mnemonic = 'cbz';
    static syntax = [ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, 11];

    constructor(rt, imm11) {
        super(0b10110100000);
        this.rt = rt;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(0, 0, 0b01, 1, 0, 0, 0, 0, 0, 0, 0);
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

export default CBZInstruction;