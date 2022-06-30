import { Instruction, ArgumentType } from "./instruction";

class ADRInstruction extends Instruction {
    static mnemonic = 'adr';
    static syntax = [ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, 11];

    constructor(rt, imm11) {
        super(0b00010000000);
        this.rt = rt;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(0, 1, 0b01, 0, 0, 0, 0, 0, 0, 0, 1);
    }

    if(simulator) {
        return {
            aluImm: this.imm11,
            readReg2: this.rt
        };
    }
    
    ex(simulator) {
        return {
            aluAction: 0b0111,
            aluResult: this.imm11
        };
    }
}

export default ADRInstruction;