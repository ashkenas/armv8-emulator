import { Instruction, ArgumentType } from "@inst/instruction";

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
        this.result = this.opn - this.imm11;
        simulator.registers.flags.setBit(0, this.result === 0n ? 1 : 0);
        
        return {
            aluAction: 0b1011,
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

export default SUBISInstruction;