import { Instruction, ArgumentType } from "./instruction";

class SUBISInstruction extends Instruction {
    static mnemonic = 'subs';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, null, 11];

    constructor(rd, rn, imm11) {
        super(0b11110001000);
        this.rd = rd;
        this.rn = rn;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(1, 1, 0b11, 0, 0, 0, 0, 0, 0, 0, 1);
    }

    if(cpu) {
        return {
            readReg1: this.rn,
            writeReg: this.rd,
            aluImm: this.imm11
        };
    }

    id(cpu) {
        this.opn = cpu.registers.getRegister(this.rn);

        return {
            aluAction: 0b0011,
            readData1: this.opn
        };
    }

    ex(cpu) {
        this.result = this.opn - this.imm11;
        cpu.registers.flags.setBit(0, this.result === 0n ? 1 : 0);
        
        return {
            aluResult: this.result
        };
    }

    wb(cpu) {
        cpu.registers.setRegister(this.rd, this.result);

        return {
            writeData: this.result
        };
    }
}

export default SUBISInstruction;