import { Instruction, ArgumentType } from "@inst/instruction";

class SUBSInstruction extends Instruction {
    static mnemonic = 'subs';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Register];
    static restrictions = [null, null, null];

    constructor(rd, rn, rm) {
        super(0b11101011001);
        this.rd = rd;
        this.rn = rn;
        this.rm = rm;
        this.encodeInstruction();
        this.setControlSignals(1, 0, 0b11, 0, 0, 0, 0, 0, 0, 0, 1);
    }

    if(simulator) {
        return {
            readReg1: this.rn,
            readReg2: this.rm,
            writeReg: this.rd
        };
    }

    id(simulator) {
        this.opn = simulator.registers.getRegister(this.rn);
        this.opm = simulator.registers.getRegister(this.rm);

        return {
            readData1: this.opn,
            readData2: this.opm
        };
    }

    ex(simulator) {
        this.result = this.opn - this.opm;
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

export default SUBSInstruction;