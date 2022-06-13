import { Instruction, ArgumentType } from "./instruction";

class STURInstruction extends Instruction {
    static mnemonic = 'stur';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, null, 11];
    
    constructor(rt, rn, imm11) {
        super(0b11111000000);
        this.rt = rt;
        this.rn = rn;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(0, 1, 0b00, 0, 0, 0, 1, 0, 0, 0, 0);
    }

    if(cpu) {
        return {
            readReg1: this.rn,
            readReg2: this.rt,
            aluImm: this.imm11
        };
    }

    id(cpu) {
        this.opn = cpu.registers.getRegister(this.rn);
        this.data = cpu.registers.getRegister(this.rt);

        return {
            readData1: this.opn,
            readData2: this.data
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
        cpu.memory.writeDoubleWord(this.result, this.data);

        return {};
    }
}

export default STURInstruction;