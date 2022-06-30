import { Instruction, ArgumentType } from "./instruction";

class ADDIInstruction extends Instruction {
    static mnemonic = 'add';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, null, 11];

    constructor(rd, rn, imm11) {
        super(0b10010001000);
        this.rd = rd;
        this.rn = rn;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(1, 1, 0b10, 0, 0, 0, 0, 0, 0, 0, 1);
    }

    if(cpu) {
        console.log('test');
        return {
            readReg1: this.rn,
            writeReg: this.rd,
            aluImm: this.imm11
        };
    }

    id(cpu) {
        console.log('test2');
        this.opn = cpu.registers.getRegister(this.rn);

        return {
            readData1: this.opn
        };
    }

    ex(cpu) {
        console.log('test3');
        this.result = this.imm11 + this.opn;
        
        return {
            aluAction: 0b0010,
            aluResult: this.result
        };
    }

    wb(cpu) {
        console.log('test5');
        cpu.registers.setRegister(this.rd, this.result);

        return {
            writeData: this.result
        };
    }
}

export default ADDIInstruction;