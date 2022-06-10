import ArgumentType from "./argumentType";
import Instruction from "./instruction";
import InstructionRegistry from "./instructionRegistry";

class ADDIInstruction extends Instruction {
    static mnemonic = 'add';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, null, 11];

    constructor(rd, rn, imm11) {
        super();
        this.rd = rd;
        this.rn = rn;
        this.imm11 = imm11;
        this.setControlSignals(1, 1, 0b10, 0, 0, 0, 0, 0, 0, 0, 1);
        this.encoding = (0b1001000100 << 22) + (this.imm11 << 10) + (this.rn << 5) + rd;
    }

    if(cpu) {
        return {
            encoding: this.encoding,
            readReg1: this.rn,
            writeReg: this.rd,
            aluImm: this.imm11
        };
    }

    id(cpu) {
        this.opn = cpu.registers.getRegister(this.rn);

        return {
            aluAction: 0b0010,
            readData1: this.opn
        };
    }

    ex(cpu) {
        this.result = this.imm11 + this.opn;
        
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

InstructionRegistry.register(ADDIInstruction.mnemonic, ADDIInstruction.syntax, ADDIInstruction);

export default ADDIInstruction;