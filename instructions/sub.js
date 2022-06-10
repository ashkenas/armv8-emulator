import { Instruction, ArgumentType } from "./instruction";

class SUBInstruction extends Instruction {
    static mnemonic = 'sub';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Register];
    static restrictions = [null, null, null];

    constructor(rd, rn, rm) {
        super(0b11001011001);
        this.rd = rd;
        this.rn = rn;
        this.rm = rm;
        this.encodeInstruction();
        this.setControlSignals(1, 0, 0b10, 0, 0, 0, 0, 0, 0, 0, 1);
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
            aluAction: 0b0011,
            readData1: this.opn,
            readData2: this.opm
        };
    }

    ex(cpu) {
        this.result = this.opn - this.opm;
        
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

export default SUBInstruction;