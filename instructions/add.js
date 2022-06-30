import { Instruction, ArgumentType } from "./instruction";

class ADDInstruction extends Instruction {
    static mnemonic = 'add';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Register];
    static restrictions = [null, null, null];
    
    constructor(rd, rn, rm) {
        super(0b10001011001);
        this.rd = rd;
        this.rn = rn;
        this.rm = rm;
        this.encodeInstruction();
        this.setControlSignals(1, 0, 0b10, 0, 0, 0, 0, 0, 0, 0, 1);
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
        this.result = this.opn + this.opm;
        
        return {
            aluAction: 0b0010,
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

export default ADDInstruction;