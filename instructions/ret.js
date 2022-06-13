import { Instruction, ArgumentType } from "./instruction";

class RETInstruction extends Instruction {
    static mnemonic = 'ret';
    static syntax = [];
    static restrictions = [];

    constructor() {
        super(0b11010110010);
        this.rt = 0b11110;
        this.encodeInstruction();
        this.setControlSignals(0, 0, 0b01, 0, 0, 1, 0, 0, 0, 0, 0);
    }

    if(cpu) {
        return {
            readReg2: this.rt
        };
    }

    id(cpu) {
        this.opn = cpu.registers.getRegister(this.rt);

        return {
            readData2: this.opn
        };
    }
    
    ex(cpu) {
        return {
            aluAction: 0b0111,
            aluResult: this.opn
        };
    }
}

export default RETInstruction;