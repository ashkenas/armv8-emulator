import { Instruction, ArgumentType } from "./instruction";

class CBZInstruction extends Instruction {
    static mnemonic = 'cbz';
    static syntax = [ArgumentType.register, ArgumentType.Immediate];
    static restrictions = [null, 11];

    constructor(rt, imm11) {
        super(0b10110100000);
        this.rt = rt;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(0, 0, 0b01, 1, 0, 0, 0, 0, 0, 0, 0);
    }

    if(simulator) {
        return {
            aluImm: this.imm11,
            readReg2: this.rt
        };
    }

    id(simulator) {
        this.opn = simulator.registers.getRegister(this.rt);

        return {
            readData2: this.opn
        };
    }
    
    ex(simulator) {
        return {
            aluAction: 0b0111,
            aluResult: this.opn,
            branchPC: this.imm11 + simulator.program.currentInstruction * 4
        };
    }
}

export default CBZInstruction;