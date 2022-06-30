import { Instruction, ArgumentType } from "./instruction";

class ORRIInstruction extends Instruction {
    static mnemonic = 'orr';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, null, 11];

    constructor(rd, rn, imm11) {
        super(0b10110010000);
        this.rd = rd;
        this.rn = rn;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(1, 1, 0b10, 0, 0, 0, 0, 0, 0, 0, 1);
    }

    if(simulator) {
        return {
            readReg1: this.rn,
            writeReg: this.rd,
            aluImm: this.imm11
        };
    }

    id(simulator) {
        this.opn = simulator.registers.getRegister(this.rn);

        return {
            readData1: this.opn
        };
    }

    ex(simulator) {
        this.result = this.imm11 | this.opn;
        
        return {
            aluAction: 0b0001,
            aluResult: this.result
        };
    }

    wb(simulator) {
        simulator.registers.setRegister(this.rd, this.result);

        return {
            writeData: this.result
        };
    }
}

export default ORRIInstruction;