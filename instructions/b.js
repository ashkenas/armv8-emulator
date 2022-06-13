import { Instruction, ArgumentType } from "./instruction";

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

    if(cpu) {
        return {
            aluImm: this.imm11,
            readReg2: this.rt
        };
    }

    id(cpu) {
        this.opn = cpu.registers.getRegister(this.rt);

        return {
            readData2: this.opn
        };
    }
    
    ex(cpu) {
        return {
            aluAction: 0b0111,
            aluResult: this.opn,
            branchPC: this.imm11 + cpu.program.currentInstruction * 4
        };
    }
}

export default BInstruction;