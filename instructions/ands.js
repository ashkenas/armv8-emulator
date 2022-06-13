import { Instruction, ArgumentType } from "./instruction";

class ANDSInstruction extends Instruction {
    static mnemonic = 'ands';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Register];
    static restrictions = [null, null, null];
    
    constructor(rd, rn, rm) {
        super(0b11101010000);
        this.rd = rd;
        this.rn = rn;
        this.rm = rm;
        this.encodeInstruction();
        this.setControlSignals(1, 0, 0b11, 0, 0, 0, 0, 0, 0, 0, 1);
    }

    if(cpu) {
        return {
            readReg1: this.rn,
            readReg2: this.rm,
            writeReg: this.rd
        };
    }

    id(cpu) {
        this.opn = cpu.registers.getRegister(this.rn);
        this.opm = cpu.registers.getRegister(this.rm);

        return {
            aluAction: 0b1000,
            readData1: this.opn,
            readData2: this.opm
        };
    }

    ex(cpu) {
        this.result = this.opn & this.opm;
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

export default ANDSInstruction;