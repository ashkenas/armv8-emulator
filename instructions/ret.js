import { Instruction } from "@inst/instruction";

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

    if(simulator) {
        return {
            readReg2: this.rt
        };
    }

    id(simulator) {
        this.opn = simulator.registers.getRegister(this.rt);

        return {
            readData2: this.opn
        };
    }

    mem(simulator) {
        simulator.memory.removeFrame();
    }
    
    ex(simulator) {
        return {
            aluAction: 0b0111,
            aluResult: this.opn
        };
    }
}

export default RETInstruction;