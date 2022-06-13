import { Instruction, ArgumentType } from "./instruction";

class LDURInstruction extends Instruction {
    static mnemonic = 'ldur';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, null, 11];
    
    constructor(rt, rn, imm11) {
        super(0b11111000010);
        this.rt = rt;
        this.rn = rn;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(0, 1, 0b00, 0, 0, 0, 0, 1, 1, 0, 1);
    }

    if(cpu) {
        return {
            readReg1: this.rn,
            writeReg: this.rt,
            aluImm: this.imm11
        };
    }

    id(cpu) {
        this.opn = cpu.registers.getRegister(this.rn);

        return {
            readData1: this.opn
        };
    }

    ex(cpu) {
        this.result = this.opn + this.imm11;
        
        return {
            aluAction: 0b0010,
            aluResult: this.result
        };
    }

    mem(cpu) {
        this.memValue = cpu.memory.readDoubleWord(this.result);

        return {
            readDataM: this.memValue
        };
    }

    wb(cpu) {
        cpu.registers.setRegister(this.rt, this.result);

        return {
            writeData: this.memValue
        };
    }
}

export default LDURInstruction;